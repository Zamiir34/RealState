const getFileUrl = (file) => {
  if (!file) return '';
  if (file.path?.startsWith('http')) return file.path;
  return `/uploads/${file.filename}`;
};

const mapUploadedFiles = (files = []) =>
  files.map((file) => ({ url: getFileUrl(file), publicId: file.filename }));

module.exports = { getFileUrl, mapUploadedFiles };
