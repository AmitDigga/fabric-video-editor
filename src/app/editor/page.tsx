import { StoreProvider } from "@/store";
import { Editor } from "../../components/Editor";

function EditorPage() {
  return (
    <StoreProvider>
      <Editor></Editor>
    </StoreProvider>
  );
}

EditorPage.diplsayName = "EditorPage";

export default EditorPage;
