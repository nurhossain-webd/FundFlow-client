interface ProfileImageUploadResponse {
  success: true;
  data: {
    imageURL: string;
  };
}

export const uploadProfileImage = async (file: File): Promise<string> => {
  const body = new FormData();
  body.append("image", file);

  const response = await fetch("/api/uploads/profile-image", {
    method: "POST",
    body,
    credentials: "include",
  });

  const result = (await response.json()) as
    ProfileImageUploadResponse | { success: false; message?: string };

  if (!response.ok || !result.success) {
    throw new Error(
      "message" in result && result.message
        ? result.message
        : "Unable to upload profile image",
    );
  }

  return result.data.imageURL;
};
