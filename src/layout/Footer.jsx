import { WebsiteLogo } from "@/constants/images";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <span className="footer__line"></span>
        <p className="footer__text">Powered By</p>
        <span className="footer__line"></span>
      </div>
      <img src={WebsiteLogo} alt="fathom1k logo" className="footer__logo" />
    </footer>
  );
};

export default Footer;
