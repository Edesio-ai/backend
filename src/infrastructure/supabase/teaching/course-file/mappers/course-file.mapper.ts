export const CourseFileMapper = {
  fileUrlsToDomain: (files: { file_url: string }[]): { fileUrl: string }[] =>
    files.map((f) => ({ fileUrl: f.file_url })),
};
