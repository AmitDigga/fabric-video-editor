import Image from "next/image";
export type UploadButtonProps = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  accept: string;
  name: string
};
export const UploadButton = (props: UploadButtonProps) => {
  return (
    <label htmlFor="fileInput" className={props.className}>
      <input
        id="fileInput"
        type="file"
        accept={props.accept}
        className="hidden"
        onChange={props.onChange}
      />
      <p className="flex items-center justify-center"> {props.name}
      </p>
    </label>
  );
};
