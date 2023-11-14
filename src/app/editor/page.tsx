'use client';

import dynamic from 'next/dynamic'

const DynmicEditor = dynamic(() => import('../../components/Editor').then(a => a.EditorWithStore), {
  ssr: false,
})


function EditorPage() {
  return (
    <DynmicEditor />
  );
}

EditorPage.diplsayName = "EditorPage";

export default EditorPage;
