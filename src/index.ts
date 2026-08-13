import { Paperful } from "./client";

const paperful = new Paperful();

paperful.papers.get("123123", {
  versionId: "123123",
});
