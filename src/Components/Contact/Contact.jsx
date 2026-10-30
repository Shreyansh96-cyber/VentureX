import "./Contact.css";

function Contact() {
  return (
    <section id="contact" className="contactSection">

       {/* Contact */}
      <div className="contactHeading">

        <span>CONTACT US</span>

        <h2>Get In Touch</h2>

        <p>
          We'd love to hear from you. Get in touch with our team and we'll
          respond as soon as possible.
        </p>

      </div>

      <div className="contactContainer">

        {/* LEFT */}

        <div className="contactInfo">

          <h3>Get In Touch</h3>

          <div className="infoBox">

            <div className="icon">📍</div>

            <div>

              <h4>Address</h4>

              <p>
                Prayagraj, Uttar Pradesh, India
              </p>

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

              <p>

                venturex.support@gmail.com

              </p>

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

        {/* RIGHT */}

        <div className="contactFormCard">

          <h3>Send a Message</h3>

          <form>

            <input
              type="text"
              placeholder="Your Name"
            />

            <input
              type="email"
              placeholder="Your Email"
            />

            <input
              type="text"
              placeholder="Subject"
            />

            <textarea
              rows="6"
              placeholder="Your Message"
            ></textarea>

            <button>

              Send Message

            </button>

          </form>

        </div>

      </div>

    </section>

  );
}

export default Contact;