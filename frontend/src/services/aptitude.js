import API from "./api";

export async function fetchAptitudeQuestions(limit = 15) {
  const response = await API.get("/aptitude/questions", {
    params: { limit },
  });

  return response.data.questions || [];
}
