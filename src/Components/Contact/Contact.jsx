import { useState } from "react";
import { submitContactForm } from "../../api/contact";
import "./Contact.css";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { name, email, subject, message } = form;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setStatus({ type: "error", message: "Please fill in all fields before sending your message." });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      setStatus({
        type: "success",
        message: response?.data?.message || "Your message has been sent successfully.",
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.response?.data?.message || "We couldn't send your message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contactSection">
      <div className="contactHeading">
        <span>CONTACT US</span>
        <h2>Get In Touch</h2>
        <p>
          We'd love to hear from you. Get in touch with our team and we'll
          respond as soon as possible.
        </p>
      </div>

      <div className="contactContainer">
        <div className="contactInfo">
          <h3>Get In Touch</h3>

          <div className="infoBox">
            <div className="icon">📍</div>
            <div>
              <h4>Address</h4>
              <p>Prayagraj, Uttar Pradesh, India</p>
            </div>
          </div>

          <div className="infoBox">
            <div className="icon">📞</div>
            <div>
              <h4>Phone</h4>
              <p>
                +91 9452558851
                <br />
                +91 9838585332
              </p>
            </div>
          </div>

          <div className="infoBox">
            <div className="icon">✉</div>
            <div>
              <h4>Email</h4>
              <p>venturex.support@gmail.com</p>
            </div>
          </div>

          <div className="infoBox">
            <div className="icon">🕒</div>
            <div>
              <h4>Working Hours</h4>
              <p>
                Monday - Friday
                <br />
                9:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="contactFormCard">
          <h3>Send a Message</h3>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              aria-label="Your Name"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              aria-label="Your Email"
            />

            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject"
              aria-label="Subject"
            />

            <textarea
              name="message"
              rows="6"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message"
              aria-label="Your Message"
            ></textarea>

            {status.message ? (
              <p className={`contactStatus ${status.type}`}>{status.message}</p>
            ) : null}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;