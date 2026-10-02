import Navbar from "../Components/Navbar/Navbar";
import Hero from "../Components/Hero/Hero";
import Features from "../Components/Features/Features";
import HowItWorks from "../Components/HowItWorks/HowItWorks";
import Explore from "../Components/Explore/Explore";
import WhyChoose from "../Components/WhyChoose/WhyChoose";
import About from "../Components/About/About";
import Contact from "../Components/Contact/Contact";
import Footer from "../Components/Footer/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Explore />
      <WhyChoose />
      <About />
      <Contact />
      <Footer /> 
    </>
  );
}

export default Home;