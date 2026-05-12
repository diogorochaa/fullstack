import logging
import smtplib
from email.message import EmailMessage

from celery import shared_task

from src.core.config import settings

logger = logging.getLogger(__name__)


@shared_task(name="users.send_welcome_email")
def send_welcome_email(to_email: str) -> str:
    """Envia e-mail de boas-vindas. Sem SMTP configurado, apenas registra em log."""
    subject = f"Bem-vindo ao {settings.APP_NAME}"
    body = (
        "Ola,\n\n"
        f"Sua conta em {settings.APP_NAME} foi criada com sucesso.\n\n"
        "Se voce nao criou esta conta, ignore esta mensagem.\n"
    )

    if not settings.SMTP_HOST:
        logger.info("Welcome email (sem SMTP): para=%s assunto=%s", to_email, subject)
        return "skipped_no_smtp"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as smtp:
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                smtp.starttls()
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(msg)
    except OSError as exc:
        logger.exception("Falha ao enviar e-mail de boas-vindas para %s: %s", to_email, exc)
        raise

    logger.info("E-mail de boas-vindas enviado para %s", to_email)
    return "sent"
