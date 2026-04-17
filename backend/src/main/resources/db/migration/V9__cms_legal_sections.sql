insert into cms_sections (section, payload, updated_at) values
(
  'privacy',
  '{"content":"This is a starter privacy policy. Sign in as admin → Privacy to replace this with your final legal text. It should describe what data you collect, how you use cookies and advertising partners (e.g. Google AdSense), and how users can contact you."}'::jsonb,
  now()
),
(
  'terms',
  '{"content":"This is a starter terms of use page. Sign in as admin → Terms to replace this with your final legal text. Cover listing rules, liability limits, and acceptable use for buyers, sellers, and agents."}'::jsonb,
  now()
)
on conflict (section) do nothing;
