<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $payload['subject'] }}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:680px;margin:0 auto;padding:24px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(15,23,42,0.05);">
            <p style="margin:0 0 16px;font-size:14px;color:#64748b;">StudyBridge Reminder</p>
            <h2 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#0f172a;">{{ $payload['heading'] }}</h2>

            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Hello {{ $payload['student_name'] }},</p>

            @foreach ($payload['paragraphs'] as $paragraph)
                <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">{{ $paragraph }}</p>
            @endforeach

            <div style="margin:24px 0;padding:18px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
                <p style="margin:0 0 10px;font-size:14px;"><strong>Scholarship:</strong> {{ $payload['scholarship_title'] }}</p>
                <p style="margin:0 0 10px;font-size:14px;"><strong>University:</strong> {{ $payload['university_name'] }}</p>
                <p style="margin:0 0 10px;font-size:14px;"><strong>Deadline:</strong> {{ $payload['deadline_text'] }}</p>

                @if (!empty($payload['status_label']))
                    <p style="margin:0 0 10px;font-size:14px;"><strong>Application Status:</strong> {{ $payload['status_label'] }}</p>
                @endif

                @if (!empty($payload['agent_note']))
                    <p style="margin:0;font-size:14px;"><strong>Agent Note:</strong> {{ $payload['agent_note'] }}</p>
                @endif
            </div>

            @if (!empty($payload['footer_note']))
                <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#64748b;">{{ $payload['footer_note'] }}</p>
            @endif
        </div>
    </div>
</body>
</html>