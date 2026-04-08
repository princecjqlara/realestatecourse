import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { defaultDatabase } from "./default-course";
import type {
  AuthEventRecord,
  FunnelDatabase,
  LeadAttribution,
  LeadCourseSnapshot,
  LeadRecord,
  SubtopicRecord,
  TopicRecord,
  WatchEventRecord,
} from "./types";

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "funnel-db.json");

function cloneDefaultDatabase(): FunnelDatabase {
  return JSON.parse(JSON.stringify(defaultDatabase)) as FunnelDatabase;
}

function isSupabaseDataStoreConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseServiceClient() {
  if (!isSupabaseDataStoreConfigured()) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

function assertWritableStoreAvailable() {
  if (getSupabaseServiceClient()) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for production data writes.");
  }
}

async function ensureDatabaseFile() {
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(dataFile, JSON.stringify(cloneDefaultDatabase(), null, 2));
  }
}

async function readDatabase() {
  await ensureDatabaseFile();

  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw) as FunnelDatabase;
}

async function saveDatabase(database: FunnelDatabase) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(database, null, 2));
}

function buildCourseSnapshot(database: FunnelDatabase): LeadCourseSnapshot {
  const sortedTopics = [...database.topics].sort((left, right) => left.position - right.position);
  const sortedSubtopics = [...database.subtopics].sort(
    (left, right) => left.position - right.position,
  );

  return {
    course: database.course,
    topics: sortedTopics.map((topic) => ({
      ...topic,
      subtopics: sortedSubtopics.filter((subtopic) => subtopic.topicId === topic.id),
    })),
  };
}

function buildAuthEvent(leadId: string, type: AuthEventRecord["type"]): AuthEventRecord {
  return {
    id: randomUUID(),
    leadId,
    type,
    createdAt: new Date().toISOString(),
  };
}

function mapLeadRow(row: Record<string, unknown>): LeadRecord {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    phone: String(row.phone),
    companies: Array.isArray(row.companies) ? row.companies.map(String) : [],
    propertyTypes: Array.isArray(row.property_types) ? row.property_types.map(String) : [],
    salesFocus: String(row.sales_focus),
    attribution: {
      utmSource: row.utm_source ? String(row.utm_source) : null,
      utmMedium: row.utm_medium ? String(row.utm_medium) : null,
      utmCampaign: row.utm_campaign ? String(row.utm_campaign) : null,
      utmContent: row.utm_content ? String(row.utm_content) : null,
      fbclid: row.fbclid ? String(row.fbclid) : null,
      landingPath: row.landing_path ? String(row.landing_path) : null,
    },
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapTopicRow(row: Record<string, unknown>): TopicRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    summary: String(row.summary),
    position: Number(row.position),
  };
}

function mapSubtopicRow(row: Record<string, unknown>): SubtopicRecord {
  return {
    id: String(row.id),
    topicId: String(row.topic_id),
    title: String(row.title),
    summary: String(row.summary),
    position: Number(row.position),
    durationSeconds: Number(row.duration_seconds),
    videoUrl: String(row.video_url),
  };
}

function mapAuthEventRow(row: Record<string, unknown>): AuthEventRecord {
  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    type: row.type as AuthEventRecord["type"],
    createdAt: String(row.created_at),
  };
}

function mapWatchEventRow(row: Record<string, unknown>): WatchEventRecord {
  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    subtopicId: String(row.subtopic_id),
    sessionId: String(row.session_id),
    watchedSeconds: Number(row.watched_seconds),
    positionSeconds: Number(row.position_seconds),
    createdAt: String(row.created_at),
  };
}

function leadRowFromInput(input: {
  fullName: string;
  email: string;
  phone: string;
  companies: string[];
  propertyTypes: string[];
  salesFocus: string;
  attribution: LeadAttribution;
}) {
  const now = new Date().toISOString();

  return {
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    companies: input.companies,
    property_types: input.propertyTypes,
    sales_focus: input.salesFocus,
    utm_source: input.attribution.utmSource,
    utm_medium: input.attribution.utmMedium,
    utm_campaign: input.attribution.utmCampaign,
    utm_content: input.attribution.utmContent,
    fbclid: input.attribution.fbclid,
    landing_path: input.attribution.landingPath,
    updated_at: now,
  };
}

async function readSupabaseCourseSnapshot() {
  const client = getSupabaseServiceClient();
  if (!client) {
    return null;
  }

  const [{ data: topicRows, error: topicsError }, { data: subtopicRows, error: subtopicsError }] =
    await Promise.all([
      client.from("topics").select("*").order("position", { ascending: true }),
      client.from("subtopics").select("*").order("position", { ascending: true }),
    ]);

  if (topicsError) {
    throw new Error(topicsError.message);
  }

  if (subtopicsError) {
    throw new Error(subtopicsError.message);
  }

  const topics = topicRows?.length ? topicRows.map((row) => mapTopicRow(row)) : defaultDatabase.topics;
  const subtopics = subtopicRows?.length
    ? subtopicRows.map((row) => mapSubtopicRow(row))
    : defaultDatabase.subtopics;

  return buildCourseSnapshot({
    ...cloneDefaultDatabase(),
    topics,
    subtopics,
  });
}

export async function getCourseSnapshot() {
  const supabaseSnapshot = await readSupabaseCourseSnapshot();
  if (supabaseSnapshot) {
    return supabaseSnapshot;
  }

  const database = await readDatabase();
  return buildCourseSnapshot(database);
}

export async function getLeadById(leadId: string) {
  const client = getSupabaseServiceClient();
  if (client) {
    const { data, error } = await client.from("leads").select("*").eq("id", leadId).maybeSingle();
    if (error) {
      throw new Error(error.message);
    }

    return data ? mapLeadRow(data) : null;
  }

  const database = await readDatabase();
  return database.leads.find((lead) => lead.id === leadId) ?? null;
}

export async function getLeadByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const client = getSupabaseServiceClient();

  if (client) {
    const { data, error } = await client
      .from("leads")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }

    return data ? mapLeadRow(data) : null;
  }

  const database = await readDatabase();
  return database.leads.find((lead) => lead.email.toLowerCase() === normalizedEmail) ?? null;
}

export async function upsertLead(input: {
  fullName: string;
  email: string;
  phone: string;
  companies: string[];
  propertyTypes: string[];
  salesFocus: string;
  attribution: LeadAttribution;
}) {
  const client = getSupabaseServiceClient();

  if (client) {
    const { data, error } = await client
      .from("leads")
      .upsert(leadRowFromInput(input), { onConflict: "email" })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const lead = mapLeadRow(data);
    await recordAuthEvent(lead.id, "form-access");
    return lead;
  }

  assertWritableStoreAvailable();
  const database = await readDatabase();
  const now = new Date().toISOString();
  const existingLead = database.leads.find((lead) => lead.email === input.email);

  if (existingLead) {
    existingLead.fullName = input.fullName;
    existingLead.phone = input.phone;
    existingLead.companies = input.companies;
    existingLead.propertyTypes = input.propertyTypes;
    existingLead.salesFocus = input.salesFocus;
    existingLead.attribution = input.attribution;
    existingLead.updatedAt = now;

    database.authEvents.push(buildAuthEvent(existingLead.id, "form-access"));
    await saveDatabase(database);
    return existingLead;
  }

  const lead: LeadRecord = {
    id: randomUUID(),
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    companies: input.companies,
    propertyTypes: input.propertyTypes,
    salesFocus: input.salesFocus,
    attribution: input.attribution,
    createdAt: now,
    updatedAt: now,
  };

  database.leads.push(lead);
  database.authEvents.push(buildAuthEvent(lead.id, "form-access"));
  await saveDatabase(database);

  return lead;
}

export async function recordAuthEvent(leadId: string, type: AuthEventRecord["type"]) {
  const client = getSupabaseServiceClient();
  if (client) {
    const { error } = await client.from("auth_events").insert({
      lead_id: leadId,
      type,
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  assertWritableStoreAvailable();
  const database = await readDatabase();
  database.authEvents.push(buildAuthEvent(leadId, type));
  await saveDatabase(database);
}

export async function recordWatchEvent(input: {
  leadId: string;
  subtopicId: string;
  sessionId: string;
  watchedSeconds: number;
  positionSeconds: number;
}) {
  const client = getSupabaseServiceClient();
  if (client) {
    const { error } = await client.from("watch_events").insert({
      lead_id: input.leadId,
      subtopic_id: input.subtopicId,
      session_id: input.sessionId,
      watched_seconds: input.watchedSeconds,
      position_seconds: input.positionSeconds,
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const database = await readDatabase();
  database.watchEvents.push({
    id: randomUUID(),
    leadId: input.leadId,
    subtopicId: input.subtopicId,
    sessionId: input.sessionId,
    watchedSeconds: input.watchedSeconds,
    positionSeconds: input.positionSeconds,
    createdAt: new Date().toISOString(),
  });
  await saveDatabase(database);
}

export async function getSubtopicById(subtopicId: string) {
  const client = getSupabaseServiceClient();
  if (client) {
    const { data, error } = await client
      .from("subtopics")
      .select("*")
      .eq("id", subtopicId)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }

    return data ? mapSubtopicRow(data) : null;
  }

  const database = await readDatabase();
  return database.subtopics.find((subtopic) => subtopic.id === subtopicId) ?? null;
}

export async function getAdminSnapshot() {
  const client = getSupabaseServiceClient();
  if (client) {
    const [leadResult, authResult, watchResult, topicResult, subtopicResult] = await Promise.all([
      client.from("leads").select("*"),
      client.from("auth_events").select("*"),
      client.from("watch_events").select("*"),
      client.from("topics").select("*"),
      client.from("subtopics").select("*"),
    ]);

    for (const result of [leadResult, authResult, watchResult, topicResult, subtopicResult]) {
      if (result.error) {
        throw new Error(result.error.message);
      }
    }

    return {
      ...cloneDefaultDatabase(),
      leads: (leadResult.data ?? []).map((row) => mapLeadRow(row)),
      authEvents: (authResult.data ?? []).map((row) => mapAuthEventRow(row)),
      watchEvents: (watchResult.data ?? []).map((row) => mapWatchEventRow(row)),
      topics: (topicResult.data ?? []).map((row) => mapTopicRow(row)),
      subtopics: (subtopicResult.data ?? []).map((row) => mapSubtopicRow(row)),
    } satisfies FunnelDatabase;
  }

  return readDatabase();
}

export async function addTopic(input: { title: string; summary: string }) {
  const client = getSupabaseServiceClient();
  if (client) {
    const { data: lastTopic, error: readError } = await client
      .from("topics")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    const { error } = await client.from("topics").insert({
      title: input.title,
      summary: input.summary,
      position: (lastTopic?.position ?? 0) + 1,
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const database = await readDatabase();
  const nextPosition = Math.max(0, ...database.topics.map((topic) => topic.position)) + 1;

  database.topics.push({
    id: randomUUID(),
    title: input.title,
    summary: input.summary,
    position: nextPosition,
  });

  await saveDatabase(database);
}

export async function addSubtopic(input: {
  topicId: string;
  title: string;
  summary: string;
  durationSeconds: number;
  videoUrl: string;
}) {
  const client = getSupabaseServiceClient();
  if (client) {
    const { data: lastSubtopic, error: readError } = await client
      .from("subtopics")
      .select("position")
      .eq("topic_id", input.topicId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    const { error } = await client.from("subtopics").insert({
      topic_id: input.topicId,
      title: input.title,
      summary: input.summary,
      duration_seconds: input.durationSeconds,
      video_url: input.videoUrl,
      position: (lastSubtopic?.position ?? 0) + 1,
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const database = await readDatabase();
  const topicSubtopics = database.subtopics.filter((subtopic) => subtopic.topicId === input.topicId);
  const nextPosition = Math.max(0, ...topicSubtopics.map((subtopic) => subtopic.position)) + 1;

  const subtopic: SubtopicRecord = {
    id: randomUUID(),
    topicId: input.topicId,
    title: input.title,
    summary: input.summary,
    durationSeconds: input.durationSeconds,
    videoUrl: input.videoUrl,
    position: nextPosition,
  };

  database.subtopics.push(subtopic);
  await saveDatabase(database);
}
