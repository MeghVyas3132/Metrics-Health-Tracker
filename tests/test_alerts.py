import pytest
from app.alerts import send_slack_alert


def test_send_slack_alert_no_webhook(monkeypatch, caplog):
    # Ensure no exception when webhook not configured
    monkeypatch.setenv("ALERT_SLACK_WEBHOOK", "")
    # call - should quietly skip
    send_slack_alert("test message", service_id=123)
