'use server';

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import type { ActionState } from "@/app/action-state";

import { getAdminCredentials } from "@/lib/admin";
import { getAppSessionSecret } from "@/lib/auth/secret";
import {
  clearAdminSession,
  clearLeadSession,
  getAdminSessionId,
  setAdminSession,
  setLeadSession,
} from "@/lib/auth/cookies";
import {
  addSubtopic,
  addTopic,
  deleteSubtopic,
  deleteTopic,
  getLeadByEmail,
  recordAuthEvent,
  updateCoursePreview,
  updateSubtopic,
  updateTopic,
  upsertLead,
} from "@/lib/funnel/repository";
import { resolveSubmittedCoursePreviewMedia } from "@/lib/funnel/course-preview-media";
import { OFFER_WINDOW_COOKIE_NAME, readSignedOfferWindow } from "@/lib/funnel/offer-window";
import { leadFormSchema } from "@/lib/funnel/schema";
import { resolveStructureEditorIntent } from "@/lib/funnel/structure-editor";
import { resolveSubmittedSubtopicButtons } from "@/lib/funnel/subtopic-buttons";
import { resolveSubmittedVideoUrl } from "@/lib/funnel/subtopic-media";
import { getBaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

const emailSchema = z.string().trim().toLowerCase().email("Please enter a valid email.");

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalValue(formData: FormData, key: string) {
  const value = getStringValue(formData, key).trim();
  return value.length > 0 ? value : null;
}

function getFormDataStringArray(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => (typeof value === "string" ? value : ""));
}

function getSubmittedButtons(formData: FormData) {
  const labels = getFormDataStringArray(formData, "buttonLabel");
  const urls = getFormDataStringArray(formData, "buttonUrl");

  return resolveSubmittedSubtopicButtons(
    labels.map((label, index) => ({
      label,
      url: urls[index] ?? "",
    })),
  );
}

async function requireAdminAction() {
  const adminId = await getAdminSessionId();

  if (!adminId) {
    redirect("/admin");
  }
}

export async function submitLeadAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cookieStore = await cookies();
  const offerWindow = await readSignedOfferWindow(
    cookieStore.get(OFFER_WINDOW_COOKIE_NAME)?.value,
    getAppSessionSecret(),
  );

  if (!offerWindow || offerWindow.expiresAtMs <= Date.now()) {
    return {
      status: "error",
      message: "Tapos na ang free claim window sa browser na ito.",
    };
  }

  const parsedLead = leadFormSchema.safeParse({
    fullName: getStringValue(formData, "fullName"),
    email: getStringValue(formData, "email"),
    phone: getStringValue(formData, "phone"),
    companies: getStringValue(formData, "companies"),
    propertyTypes: getStringValue(formData, "propertyTypes"),
    salesFocus: getStringValue(formData, "salesFocus"),
  });

  if (!parsedLead.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedLead.error.flatten().fieldErrors,
    };
  }

  try {
    const lead = await upsertLead({
      ...parsedLead.data,
      attribution: {
        utmSource: getOptionalValue(formData, "utmSource"),
        utmMedium: getOptionalValue(formData, "utmMedium"),
        utmCampaign: getOptionalValue(formData, "utmCampaign"),
        utmContent: getOptionalValue(formData, "utmContent"),
        fbclid: getOptionalValue(formData, "fbclid"),
        landingPath: getOptionalValue(formData, "landingPath"),
      },
    });

    await setLeadSession(lead.id);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save the lead right now.",
    };
  }

  redirect("/course");
}

export async function resumeCourseAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsedEmail = emailSchema.safeParse(getStringValue(formData, "email"));

  if (!parsedEmail.success) {
    return {
      status: "error",
      message: parsedEmail.error.issues[0]?.message,
    };
  }

  const lead = await getLeadByEmail(parsedEmail.data);
  if (!lead) {
    return {
      status: "error",
      message: "We could not restore access with that email. Use the same address you entered on the lead form.",
    };
  }

  try {
    if (isSupabaseConfigured()) {
      let redirectBaseUrl: string;

      try {
        redirectBaseUrl = getBaseUrl();
      } catch (error) {
        return {
          status: "error",
          message: error instanceof Error ? error.message : "Magic-link auth is not configured.",
        };
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { error } = await supabase.auth.signInWithOtp({
        email: lead.email,
        options: {
          emailRedirectTo: `${redirectBaseUrl}/auth/callback`,
        },
      });

      if (error) {
        return {
          status: "error",
          message: error.message,
        };
      }

      await recordAuthEvent(lead.id, "magic-link-sent");

      return {
        status: "success",
        message: "Your secure course link is on the way. Check the same inbox you used on the form.",
      };
    }

    await recordAuthEvent(lead.id, "resume-login");
    await setLeadSession(lead.id);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to restore course access right now.",
    };
  }

  redirect("/course");
}

export async function adminLoginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const submittedEmail = emailSchema.safeParse(getStringValue(formData, "email"));
  const password = getStringValue(formData, "password");

  if (!submittedEmail.success || !password) {
    return {
      status: "error",
      message: "Enter the admin email and password.",
    };
  }

  const credentials = getAdminCredentials();
  if (!credentials) {
    return {
      status: "error",
      message: "Admin credentials are not configured.",
    };
  }

  if (
    submittedEmail.data !== credentials.email.trim().toLowerCase() ||
    password !== credentials.password
  ) {
    return {
      status: "error",
      message: "Invalid admin credentials.",
    };
  }

  try {
    await setAdminSession(submittedEmail.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create the admin session.",
    };
  }

  redirect("/admin/dashboard");
}

export async function signOutLeadAction() {
  await clearLeadSession();
  redirect("/");
}

export async function signOutAdminAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function addTopicAction(formData: FormData) {
  await requireAdminAction();

  const parsed = z
    .object({
      title: z.string().trim().min(2, "Topic title is required."),
      summary: z.string().trim().min(10, "Add a short topic summary."),
    })
    .safeParse({
      title: getStringValue(formData, "title"),
      summary: getStringValue(formData, "summary"),
    });

  if (!parsed.success) {
    redirect("/admin/content?topicError=1");
  }

  try {
    await addTopic(parsed.data);
  } catch {
    redirect("/admin/content?topicError=1");
  }

  revalidatePath("/admin/content");
  redirect("/admin/content?topicSaved=1");
}

export async function addSubtopicAction(formData: FormData) {
  await requireAdminAction();

  const submittedButtons = getSubmittedButtons(formData);

  const parsed = z
    .object({
      topicId: z.string().trim().min(1, "Topic is required."),
      title: z.string().trim().min(2, "Subtopic title is required."),
      summary: z.string().trim().min(10, "Add a short subtopic summary."),
      durationSeconds: z.coerce.number().int().min(1).max(7200),
      videoUrl: z.url("Enter a valid video URL."),
    })
    .safeParse({
      topicId: getStringValue(formData, "topicId"),
      title: getStringValue(formData, "title"),
      summary: getStringValue(formData, "summary"),
      durationSeconds: getStringValue(formData, "durationSeconds"),
      videoUrl: resolveSubmittedVideoUrl({
        cloudinaryVideoUrl: getStringValue(formData, "cloudinaryVideoUrl"),
        videoUrl: getStringValue(formData, "videoUrl"),
      }),
    });

  if (!parsed.success) {
    redirect("/admin/content?subtopicError=1");
  }

  try {
    await addSubtopic({
      ...parsed.data,
      buttons: submittedButtons,
    });
  } catch {
    redirect("/admin/content?subtopicError=1");
  }

  revalidatePath("/admin/content");
  redirect("/admin/content?subtopicSaved=1");
}

export async function updateTopicAction(formData: FormData) {
  await requireAdminAction();

  const intent = resolveStructureEditorIntent({
    entityId: getStringValue(formData, "entityId"),
    entityType: "topic",
    intent: "edit",
  });

  const parsed = z
    .object({
      title: z.string().trim().min(2),
      summary: z.string().trim().min(10),
    })
    .safeParse({
      title: getStringValue(formData, "title"),
      summary: getStringValue(formData, "summary"),
    });

  if (!parsed.success) redirect("/admin/content?topicError=1");

  await updateTopic({ id: intent.entityId, ...parsed.data });
  revalidatePath("/admin/content");
  redirect("/admin/content?topicSaved=1");
}

export async function deleteTopicAction(formData: FormData) {
  await requireAdminAction();
  const intent = resolveStructureEditorIntent({
    entityId: getStringValue(formData, "entityId"),
    entityType: "topic",
    intent: "delete",
  });
  await deleteTopic(intent.entityId);
  revalidatePath("/admin/content");
  redirect("/admin/content?topicSaved=1");
}

export async function updateSubtopicAction(formData: FormData) {
  await requireAdminAction();
  const intent = resolveStructureEditorIntent({
    entityId: getStringValue(formData, "entityId"),
    entityType: "subtopic",
    intent: "edit",
  });
  const submittedButtons = getSubmittedButtons(formData);

  const parsed = z
    .object({
      topicId: z.string().trim().min(1),
      title: z.string().trim().min(2),
      summary: z.string().trim().min(10),
      durationSeconds: z.coerce.number().int().min(1).max(7200),
      videoUrl: z.url(),
    })
    .safeParse({
      topicId: getStringValue(formData, "topicId"),
      title: getStringValue(formData, "title"),
      summary: getStringValue(formData, "summary"),
      durationSeconds: getStringValue(formData, "durationSeconds"),
      videoUrl: resolveSubmittedVideoUrl({
        cloudinaryVideoUrl: getStringValue(formData, "cloudinaryVideoUrl"),
        videoUrl: getStringValue(formData, "videoUrl"),
      }),
    });

  if (!parsed.success) redirect("/admin/content?subtopicError=1");

  await updateSubtopic({ id: intent.entityId, ...parsed.data, buttons: submittedButtons });
  revalidatePath("/admin/content");
  redirect("/admin/content?subtopicSaved=1");
}

export async function deleteSubtopicAction(formData: FormData) {
  await requireAdminAction();
  const intent = resolveStructureEditorIntent({
    entityId: getStringValue(formData, "entityId"),
    entityType: "subtopic",
    intent: "delete",
  });
  await deleteSubtopic(intent.entityId);
  revalidatePath("/admin/content");
  redirect("/admin/content?subtopicSaved=1");
}

export async function updateCoursePreviewAction(formData: FormData) {
  await requireAdminAction();

  let payload;
  try {
    payload = resolveSubmittedCoursePreviewMedia({
      previewMediaType: getStringValue(formData, "previewMediaType"),
      previewThumbnailUrl: resolveSubmittedVideoUrl({
        cloudinaryVideoUrl: getStringValue(formData, "cloudinaryPreviewThumbnailUrl"),
        videoUrl: getStringValue(formData, "previewThumbnailUrl"),
      }),
      previewVideoUrl: resolveSubmittedVideoUrl({
        cloudinaryVideoUrl: getStringValue(formData, "cloudinaryPreviewVideoUrl"),
        videoUrl: getStringValue(formData, "previewVideoUrl"),
      }),
    });
  } catch {
    redirect("/admin/content?topicError=1");
  }

  await updateCoursePreview(payload);
  revalidatePath("/admin/content");
  redirect("/admin/content?topicSaved=1");
}
