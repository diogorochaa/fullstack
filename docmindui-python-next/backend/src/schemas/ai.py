from pydantic import BaseModel, Field, field_validator, model_validator


class AIImagePayload(BaseModel):
    base64: str = Field(max_length=8_000_000)
    media_type: str = Field(default="image/jpeg", max_length=64)


class AIRequest(BaseModel):
    question: str = Field(default="", max_length=8000)
    images: list[AIImagePayload] = Field(default_factory=list, max_length=4)
    attachment_context: str | None = Field(default=None, max_length=200_000)
    image_base64: str | None = Field(default=None, max_length=8_000_000)
    image_media_type: str | None = Field(default=None, max_length=64)

    @field_validator("images", mode="before")
    @classmethod
    def coerce_images(cls, value):  # noqa: ANN001
        if value is None:
            return []
        return value

    @model_validator(mode="after")
    def normalize_legacy_image(self) -> "AIRequest":
        if self.image_base64 and self.image_base64.strip() and not self.images:
            self.images = [
                AIImagePayload(
                    base64=self.image_base64.strip(),
                    media_type=self.image_media_type or "image/jpeg",
                )
            ]
        return self

    @model_validator(mode="after")
    def question_or_attachments(self) -> "AIRequest":
        has_images = any(img.base64.strip() for img in self.images)
        has_question = bool(self.question.strip())
        has_context = bool(self.attachment_context and self.attachment_context.strip())
        if not has_images and not has_question and not has_context:
            raise ValueError("Informe uma pergunta, imagem(ns) ou contexto de anexos.")
        return self
