import API from "./api";
import { getResumeFingerprint } from "../utils/resumeAnalysis";

export function getToolInputKey(input = {}) {
  const entries = Object.entries(input)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  return entries.length ? JSON.stringify(Object.fromEntries(entries)) : "default";
}

export async function loadToolResult(toolType, activeResume, input = {}) {
  if (!activeResume?.text?.trim()) return null;

  const resumeFingerprint = getResumeFingerprint(activeResume);
  const inputKey = getToolInputKey(input);

  const response = await API.get(`/tool-results/${toolType}`, {
    params: { resumeFingerprint, inputKey },
  });

  return response.data.toolResult;
}

export async function loadLatestToolResult(toolType, activeResume) {
  if (!activeResume?.text?.trim()) return null;

  const resumeFingerprint = getResumeFingerprint(activeResume);

  const response = await API.get("/tool-results", {
    params: { resumeFingerprint },
  });

  return (
    response.data.results?.find((item) => item.toolType === toolType) || null
  );
}

export async function loadToolResultSummary(activeResume) {
  if (!activeResume?.text?.trim()) return [];

  const resumeFingerprint = getResumeFingerprint(activeResume);

  const response = await API.get("/tool-results", {
    params: { resumeFingerprint },
  });

  return response.data.results || [];
}

export async function saveToolResult(toolType, activeResume, result, input = {}) {
  if (!activeResume?.text?.trim() || !result) return null;

  const resumeFingerprint = getResumeFingerprint(activeResume);
  const inputKey = getToolInputKey(input);

  const response = await API.post("/tool-results", {
    toolType,
    resumeFingerprint,
    resumeFileName: activeResume.fileName,
    inputKey,
    input,
    result,
  });

  return response.data.toolResult;
}

export async function deleteToolResult(toolType, activeResume, input = {}) {
  if (!activeResume?.text?.trim()) return null;

  const resumeFingerprint = getResumeFingerprint(activeResume);
  const inputKey = getToolInputKey(input);

  const response = await API.delete(`/tool-results/${toolType}`, {
    params: { resumeFingerprint, inputKey },
  });

  return response.data;
}
