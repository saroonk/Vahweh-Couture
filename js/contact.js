/* Vahweh Design — contact form behaviour (contact.html).
   The form markup is plain HTML. This script only validates it and handles the submit interaction.

   Submission: the form posts to its own `action` attribute. While `action` is empty (as now) NOTHING is sent anywhere and
   no success message is shown. Instead the visitor is told the form is not connected and can send the same text on WhatsApp.
   Once a Django view exists, set action="…" (and add {% csrf_token %}) and the real response is shown here. */
(function () {
  "use strict";
  const V = window.Vahweh;
  const form = document.getElementById("contactForm");
  if (!form) return;

  const notice = document.getElementById("formNotice");
  const submitBtn = document.getElementById("formSubmit");
  const submitLabel = submitBtn.textContent;
  const field = name => form.elements[name];
  let sending = false;

  /* ---------- Validation ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const RULES = {
    full_name: v => !v ? "Please enter your full name." : "",
    email: v => !v ? "Please enter your email address." : !EMAIL.test(v) ? "Please enter a valid email address, like name@example.com." : "",
    phone: v => v && !/^\+?[\d\s\-().]{7,20}$/.test(v) ? "Please enter a valid phone number, or leave this blank." : "",
    subject: v => !v ? "Please add a subject." : "",
    message: v => !v ? "Please write your message." : v.length < 10 ? "Your message is a little short — please add a few more words." : ""
  };
  const IDS = { full_name: "fullName", email: "email", phone: "phone", subject: "subject", message: "message" };

  function check(name) {
    const input = field(name), msg = RULES[name](input.value.trim());
    const err = document.getElementById(IDS[name] + "-err");
    err.textContent = msg; err.hidden = !msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  function validate() {
    const bad = Object.keys(RULES).filter(n => !check(n));
    if (bad.length) field(bad[0]).focus();
    return !bad.length;
  }
  // Re-check a field when leaving it, and clear its error as soon as the visitor starts fixing it
  form.addEventListener("focusout", e => { if (RULES[e.target.name] && e.target.value) check(e.target.name); });
  form.addEventListener("input", e => { if (RULES[e.target.name] && e.target.getAttribute("aria-invalid") === "true") check(e.target.name); });

  /* ---------- Status message ---------- */
  function show(kind, text, withWhatsApp) {
    notice.className = "ct-notice" + (kind ? " is-" + kind : "");
    notice.replaceChildren();
    const p = document.createElement("p"); p.textContent = text; notice.appendChild(p);
    if (withWhatsApp) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn-vd btn-vd--dark btn-vd--sm"; b.textContent = "Send this on WhatsApp";
      b.addEventListener("click", sendViaWhatsApp);
      notice.appendChild(b);
    }
    notice.hidden = false;
  }
  function sendViaWhatsApp() {
    const get = n => field(n).value.trim();
    let m = "Hello Vahweh Design,\n\n" + get("message") + "\n\nSubject: " + get("subject") + "\nName: " + get("full_name") + "\nEmail: " + get("email");
    if (get("phone")) m += "\nPhone: " + get("phone");
    V.openWhatsApp(m);
  }

  /* ---------- Submit ---------- */
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (sending) return;                       // ignore repeated submits
    notice.hidden = true;
    if (!validate()) return;

    const endpoint = form.getAttribute("action");
    if (!endpoint) {                           // not connected: be honest, send nothing, show no success message
      show("", "Thank you. Your message has not been sent: online messages aren't switched on yet. You can send the same message to us on WhatsApp instead.", true);
      return;
    }

    sending = true; submitBtn.disabled = true; submitBtn.textContent = "Sending…"; form.setAttribute("aria-busy", "true");
    try {
      const res = await fetch(endpoint, { method: "POST", body: new FormData(form) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.reset();
      Object.keys(RULES).forEach(n => field(n).setAttribute("aria-invalid", "false"));
      show("success", "Thank you — your message has been sent. We'll get back to you soon.");
    } catch (err) {
      show("error", "Sorry, we couldn't send your message. Please try again, or contact us on WhatsApp.", true);
    } finally {
      sending = false; submitBtn.disabled = false; submitBtn.textContent = submitLabel; form.removeAttribute("aria-busy");
    }
  });
})();
