# Gospel of Peace Community — Website Template

A responsive, front-end website concept for the Modern Church project.

## Preview
Open `index.html` in a modern browser. For best results, use a local development server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Included
- Responsive homepage and mobile navigation
- Modern navy, ivory, and gold design system
- Hero section, church introduction, mission and values
- Social media cards with YouTube / Facebook / Instagram filters
- Video modal preview
- Testimonies section
- Event photo gallery with image lightbox
- Upcoming events and service schedule
- Live-stream preview section
- Books and magazines showcase
- Prayer request form with WhatsApp prefilled-message handoff
- Member sign-in / registration modal preview
- Contact section and map placeholder

## Important: prototype, not production software
This package is a visual front-end template. It does not include a backend, database, admin dashboard, real social API synchronization, WhatsApp Business API delivery, secure member authentication, or a live stream connection.

Before launch:
1. Replace sample content, dates, contact details, images, and social links.
2. Replace the placeholder WhatsApp number in `app.js`.
3. Connect prayer submissions to a secure backend. For automatic notifications, use the WhatsApp Business Platform Cloud API.
4. Implement OAuth / authorized account access and official APIs for YouTube, Meta / Facebook, and Instagram. Respect each platform's permissions and quotas.
5. Build the admin dashboard, PostgreSQL schema, role-based permissions, audit logging, and secure member portal.
6. Replace the map placeholder with the church's real map embed.
7. Replace sample video URLs and configure the church's live stream.
8. Review image licenses and obtain consent for identifiable people in church photographs.
9. Add privacy policy, terms, retention rules, accessibility checks, SEO metadata, and production security controls.

## Structure
- `index.html` — page structure and sample content
- `styles.css` — responsive visual design
- `app.js` — menu, filters, preview modals, and demo form interactions

External fonts and sample photos load from Google Fonts and Unsplash, so an internet connection is needed for those assets.
