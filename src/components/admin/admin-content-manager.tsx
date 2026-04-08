'use client';

import { useState } from "react";

import {
  addSubtopicAction,
  addTopicAction,
  deleteSubtopicAction,
  deleteTopicAction,
  updateCoursePreviewAction,
  updateSubtopicAction,
  updateTopicAction,
} from "@/app/actions";
import { CloudinaryUploader } from "@/components/admin/cloudinary-uploader";
import type { LeadCourseSnapshot } from "@/lib/funnel/types";

type ButtonsEditorProps = {
  initialButtons?: Array<{ label: string; url: string }>;
};

function ButtonsEditor({ initialButtons = [{ label: "", url: "" }] }: ButtonsEditorProps) {
  const [buttons, setButtons] = useState(
    initialButtons.length > 0 ? initialButtons : [{ label: "", url: "" }],
  );

  return (
    <div className="stackList">
      <div className="topbarActions">
        <span className="fieldTitle">Lesson buttons</span>
        <button
          className="buttonSecondary"
          onClick={() => setButtons((current) => [...current, { label: "", url: "" }])}
          type="button"
        >
          Add button
        </button>
      </div>

      {buttons.map((button, index) => (
        <div className="splitGrid" key={index}>
          <label className="field">
            <span>Button label</span>
            <input
              name="buttonLabel"
              onChange={(event) => {
                const nextButtons = [...buttons];
                nextButtons[index] = { ...nextButtons[index], label: event.target.value };
                setButtons(nextButtons);
              }}
              placeholder="Get tools here"
              type="text"
              value={button.label}
            />
          </label>
          <label className="field">
            <span>Button URL</span>
            <input
              name="buttonUrl"
              onChange={(event) => {
                const nextButtons = [...buttons];
                nextButtons[index] = { ...nextButtons[index], url: event.target.value };
                setButtons(nextButtons);
              }}
              placeholder="https://example.com/setup"
              type="url"
              value={button.url}
            />
          </label>

          {buttons.length > 1 ? (
            <button
              className="buttonGhost"
              onClick={() => setButtons((current) => current.filter((_, buttonIndex) => buttonIndex !== index))}
              type="button"
            >
              Remove button
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

type SubtopicEditorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "add" | "edit";
  subtopic?: LeadCourseSnapshot["topics"][number]["subtopics"][number];
  topics: LeadCourseSnapshot["topics"];
};

function SubtopicEditorForm({ action, mode, subtopic, topics }: SubtopicEditorFormProps) {
  const [videoUrl, setVideoUrl] = useState(subtopic?.videoUrl ?? "");
  const [durationSeconds, setDurationSeconds] = useState(String(subtopic?.durationSeconds ?? ""));

  return (
    <form action={action} className="panel formPanel compactPanel">
      {subtopic ? <input name="entityId" type="hidden" value={subtopic.id} /> : null}
      <p className="eyebrow">{mode === "add" ? "Add subtopic" : "Edit subtopic"}</p>

      <label className="field">
        <span>Topic</span>
        <select defaultValue={subtopic?.topicId} name="topicId" required>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Subtopic title</span>
        <input defaultValue={subtopic?.title} name="title" placeholder="Lead follow-up timing" required type="text" />
      </label>

      <label className="field">
        <span>Summary</span>
        <textarea defaultValue={subtopic?.summary} name="summary" placeholder="What this lesson covers" required rows={3} />
      </label>

      <label className="field">
        <span>Duration in seconds</span>
        <input
          min={1}
          name="durationSeconds"
          onChange={(event) => setDurationSeconds(event.target.value)}
          required
          step={1}
          type="number"
          value={durationSeconds}
        />
      </label>

      <label className="field">
        <span>Cloudinary or media URL</span>
        <input
          name="videoUrl"
          onChange={(event) => setVideoUrl(event.target.value)}
          placeholder="https://res.cloudinary.com/your-cloud/video/upload/..."
          type="url"
          value={videoUrl}
        />
      </label>

      <CloudinaryUploader
        description="Upload the lesson video to Cloudinary. The form auto-fills the media URL and the duration in seconds."
        onUpload={(asset) => {
          setVideoUrl(asset.secureUrl);
          if (asset.durationSeconds) {
            setDurationSeconds(String(asset.durationSeconds));
          }
        }}
        resourceType="video"
        title="Lesson video"
      />

      <ButtonsEditor
        initialButtons={subtopic?.buttons.length ? subtopic.buttons : [{ label: "", url: "" }]}
      />

      <button className="buttonPrimary" type="submit">
        {mode === "add" ? "Save subtopic" : "Update subtopic"}
      </button>
    </form>
  );
}

type AdminContentManagerProps = {
  snapshot: LeadCourseSnapshot;
};

export function AdminContentManager({ snapshot }: AdminContentManagerProps) {
  const [previewMediaType, setPreviewMediaType] = useState(snapshot.course.previewMediaType);
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState(snapshot.course.previewThumbnailUrl);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(snapshot.course.previewVideoUrl);

  return (
    <>
      <section className="panel compactGap">
        <p className="eyebrow">Course preview media</p>
        <form action={updateCoursePreviewAction} className="formPanel compactPanel">
          <label className="field">
            <span>Preview media type</span>
            <select name="previewMediaType" onChange={(event) => setPreviewMediaType(event.target.value as "image" | "video")} value={previewMediaType}>
              <option value="image">Image thumbnail</option>
              <option value="video">Video thumbnail</option>
            </select>
          </label>

          <label className="field">
            <span>Preview thumbnail or media URL</span>
            <input name="previewThumbnailUrl" onChange={(event) => setPreviewThumbnailUrl(event.target.value)} type="url" value={previewThumbnailUrl} />
          </label>

          <CloudinaryUploader
            allowResourceTypeSelection
            allowRawSelection
            description="Upload the landing preview thumbnail. You can use an image or a short looping video."
            onUpload={(asset) => {
              setPreviewThumbnailUrl(asset.secureUrl);
              setPreviewMediaType(asset.resourceType === "video" ? "video" : "image");
            }}
            title="Preview thumbnail or media"
          />

          <label className="field">
            <span>Preview video URL</span>
            <input name="previewVideoUrl" onChange={(event) => setPreviewVideoUrl(event.target.value)} type="url" value={previewVideoUrl} />
          </label>

          <CloudinaryUploader
            description="Upload the full preview clip shown on the landing page."
            onUpload={(asset) => setPreviewVideoUrl(asset.secureUrl)}
            resourceType="video"
            title="Preview video"
          />

          <button className="buttonPrimary" type="submit">
            Save preview media
          </button>
        </form>
      </section>

      <div className="splitGrid">
        <form action={addTopicAction} className="panel formPanel compactPanel">
          <p className="eyebrow">Add topic</p>
          <label className="field">
            <span>Topic title</span>
            <input name="title" placeholder="Retargeting system" required type="text" />
          </label>
          <label className="field">
            <span>Summary</span>
            <textarea name="summary" placeholder="What this topic teaches and why it matters" required rows={4} />
          </label>
          <button className="buttonPrimary" type="submit">Save topic</button>
        </form>

        <SubtopicEditorForm action={addSubtopicAction} mode="add" topics={snapshot.topics} />
      </div>

      <section className="panel compactGap">
        <p className="eyebrow">Current structure</p>
        <div className="stackList">
          {snapshot.topics.map((topic) => (
            <article className="topicCard" key={topic.id}>
              <form action={updateTopicAction} className="formPanel compactPanel">
                <input name="entityId" type="hidden" value={topic.id} />
                <label className="field">
                  <span>Topic title</span>
                  <input defaultValue={topic.title} name="title" required type="text" />
                </label>
                <label className="field">
                  <span>Summary</span>
                  <textarea defaultValue={topic.summary} name="summary" required rows={3} />
                </label>
                <div className="topbarActions">
                  <button className="buttonPrimary" type="submit">Update topic</button>
                </div>
              </form>

              <form action={deleteTopicAction}>
                <input name="entityId" type="hidden" value={topic.id} />
                <button className="buttonGhost" type="submit">Delete topic</button>
              </form>

              <div className="stackList">
                {topic.subtopics.map((subtopic) => (
                  <div className="panel compactGap" key={subtopic.id}>
                    <SubtopicEditorForm action={updateSubtopicAction} mode="edit" subtopic={subtopic} topics={snapshot.topics} />
                    <form action={deleteSubtopicAction}>
                      <input name="entityId" type="hidden" value={subtopic.id} />
                      <button className="buttonGhost" type="submit">Delete subtopic</button>
                    </form>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
