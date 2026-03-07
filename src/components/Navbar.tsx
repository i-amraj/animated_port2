import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);

// Simple smoother interface for compatibility
export const smoother = {
  scrollTop: (_val?: number) => window.scrollTo({ top: _val || 0, behavior: 'smooth' }),
  paused: (_val?: boolean) => {},
  scrollTo: (target: string, smooth?: boolean, _position?: string) => {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }
};

const Navbar = () => {
  useEffect(() => {
    // Enable smooth scrolling via CSS
    document.documentElement.style.scrollBehavior = 'smooth';
    
    window.scrollTo({ top: 0 });

    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          let elem = e.currentTarget as HTMLAnchorElement;
          let section = elem.getAttribute("data-href");
          if (section) {
            const el = document.querySelector(section);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }, []);
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          RajDev
        </a>
        <a
          href="mailto:raj@example.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          raj@example.com
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
