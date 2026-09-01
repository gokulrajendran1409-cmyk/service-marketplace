import heroImg from '../assets/hero_home.png';

function Landing({ onGetStarted }) {
  return (
    <div className="landing-root">
      <div className="landing-hero-text">
        <h1 className="landing-headline">
          Trusted Experts<br />
          For Your Home<br />
          Needs
        </h1>
      </div>

      <div className="landing-hero-image-wrap">
        <div className="landing-hero-blob" />
        <img
          src={heroImg}
          alt="Home services illustration"
          className="landing-hero-img"
        />
      </div>

      <div className="landing-cta-wrap">
        <button className="landing-cta-btn" onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Landing;

