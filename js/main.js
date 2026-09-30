(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const preloader = document.getElementById("preloader");

  const scrollToHash = () => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const hidePreloader = () => {
    document.documentElement.classList.remove("is-loading");
    if (preloader) preloader.classList.add("is-done");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToHash);
    });
  };

  const ready = () =>
    Promise.race([
      Promise.all([
        document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
        new Promise((resolve) => {
          if (document.readyState !== "loading") {
            resolve();
            return;
          }
          document.addEventListener("DOMContentLoaded", resolve, { once: true });
        }),
      ]),
      new Promise((resolve) => setTimeout(resolve, 1400)),
    ]).then(hidePreloader);

  ready();

  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav") || document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    const setOpen = (open) => {
      toggle.classList.toggle("is-open", open);
      mobileNav.classList.toggle("is-open", open);
      document.body.classList.toggle("is-nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      mobileNav.setAttribute("aria-hidden", String(!open));
    };

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!toggle.classList.contains("is-open"));
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  window.addEventListener("hashchange", scrollToHash);

  if (window.lucide) {
    window.lucide.createIcons({
      attrs: { "stroke-width": 1.75 },
    });
  }

  const faqList = document.getElementById("faq-list");
  if (faqList) {
    const items = [...faqList.querySelectorAll(".faq-item")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canAnimate = !reduceMotion && typeof gsap !== "undefined";

    const setItem = (item, open) => {
      const trigger = item.querySelector(".faq-item__trigger");
      const panel = item.querySelector(".faq-item__panel");
      const answer = item.querySelector(".faq-item__answer");
      if (!trigger || !panel) return;

      const wasOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      panel.inert = !open;

      if (!canAnimate || open === wasOpen) return;

      gsap.killTweensOf([panel, answer]);
      if (open) {
        gsap.set(panel, { height: "auto", overflow: "hidden" });
        const height = panel.scrollHeight;
        gsap.fromTo(
          panel,
          { height: 0 },
          {
            height,
            duration: 0.58,
            ease: "power3.inOut",
            onComplete: () => gsap.set(panel, { height: "auto" }),
          }
        );
        if (answer) {
          gsap.fromTo(
            answer,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.42, delay: 0.1, ease: "power2.out" }
          );
        }
      } else {
        if (answer) gsap.to(answer, { opacity: 0, y: 6, duration: 0.18, ease: "power1.in" });
        gsap.to(panel, {
          height: 0,
          duration: 0.48,
          ease: "power3.inOut",
          overflow: "hidden",
        });
      }
    };

    items.forEach((item) => {
      const trigger = item.querySelector(".faq-item__trigger");
      const panel = item.querySelector(".faq-item__panel");
      if (!trigger) return;
      setItem(item, false);
      if (canAnimate && panel) gsap.set(panel, { height: 0, overflow: "hidden" });
      trigger.addEventListener("click", () => {
        const open = trigger.getAttribute("aria-expanded") === "true";
        setItem(item, !open);
      });
    });

    faqList.classList.add("is-ready");
    if (canAnimate) faqList.classList.add("is-animated");
  }

  const cookieKey = "kalisto-cookie-consent";
  const gaId = "G-QV3FZSVS33";
  const banner = document.getElementById("cookie-banner");
  const accept = document.getElementById("cookie-accept");

  const loadAnalytics = () => {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, { anonymize_ip: true });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + gaId;
    document.head.appendChild(script);
  };

  if (localStorage.getItem(cookieKey) === "accepted") {
    loadAnalytics();
  } else if (banner) {
    banner.classList.add("is-visible");
    banner.hidden = false;
  }

  if (accept && banner) {
    accept.addEventListener("click", () => {
      localStorage.setItem(cookieKey, "accepted");
      banner.classList.remove("is-visible");
      banner.hidden = true;
      loadAnalytics();
    });
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const play = () => {
    const enter = (targets, extra = {}) => {
      if (!targets || (targets.length !== undefined && !targets.length)) return;
      gsap.from(targets, {
        y: 20,
        opacity: 0,
        duration: 0.42,
        stagger: 0.06,
        ease: "power2.out",
        ...extra,
      });
    };

    enter(document.querySelectorAll(".hero-copy > *"));
    enter(document.querySelectorAll(".page-hero__copy > *"));

    document.querySelectorAll(".reveal").forEach((el) => {
      gsap.from(el, {
        y: 20,
        opacity: 0,
        duration: 0.42,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    document.querySelectorAll(".metric, .folio-item, .license, .contact-cell, .permit, .permit-group").forEach((el) => {
      gsap.from(el, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    });

    if (window.location.hash) {
      ScrollTrigger.refresh();
      scrollToHash();
    }
  };

  if (preloader && !preloader.classList.contains("is-done")) {
    const observer = new MutationObserver(() => {
      if (preloader.classList.contains("is-done")) {
        observer.disconnect();
        play();
      }
    });
    observer.observe(preloader, { attributes: true, attributeFilter: ["class"] });
  } else {
    play();
  }

  document.querySelectorAll(".folio-carousel").forEach((root) => {
    const track = root.querySelector(".folio-carousel__track");
    const viewport = root.querySelector(".folio-carousel__viewport");
    const originals = [...root.querySelectorAll(".folio-carousel__slide")];
    if (!track || !viewport || originals.length < 2) return;

    const count = originals.length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cloneSlide = (slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("img").forEach((img) => img.setAttribute("alt", ""));
      return clone;
    };
    track.insertBefore(cloneSlide(originals[count - 1]), originals[0]);
    track.appendChild(cloneSlide(originals[0]));

    let index = 1;
    let timer = 0;
    let busy = false;
    let queued = 0;
    let moveId = 0;
    let failSafe = 0;
    let inView = false;

    const apply = (animate) => {
      const width = viewport.clientWidth;
      [...track.children].forEach((slide) => {
        slide.style.flexBasis = width + "px";
      });
      track.style.transition = animate ? "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
      track.style.transform = "translate3d(" + Math.round(-index * width) + "px, 0, 0)";
    };

    const parkClone = () => {
      if (index === count + 1) index = 1;
      else if (index === 0) index = count;
      else return false;
      apply(false);
      return true;
    };

    const finish = (id) => {
      if (!busy || id !== moveId) return;
      window.clearTimeout(failSafe);
      busy = false;
      parkClone();
      if (!queued) return;
      const dir = queued;
      queued = 0;
      go(dir);
    };

    const go = (dir) => {
      if (busy) {
        queued = dir;
        return;
      }
      if (reduceMotion) {
        index += dir;
        if (index > count) index = 1;
        if (index < 1) index = count;
        apply(false);
        return;
      }
      index += dir;
      busy = true;
      moveId += 1;
      apply(true);
      const id = moveId;
      window.clearTimeout(failSafe);
      failSafe = window.setTimeout(() => finish(id), 520);
    };

    track.addEventListener("transitionend", (event) => {
      if (event.target !== track || event.propertyName !== "transform") return;
      finish(moveId);
    });

    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };

    const start = () => {
      if (reduceMotion || timer || !inView || document.hidden) return;
      timer = window.setInterval(() => go(1), 4000);
    };

    root.querySelectorAll(".folio-carousel__btn").forEach((button) => {
      button.addEventListener("click", () => {
        go(Number(button.getAttribute("data-dir")));
        stop();
        start();
      });
    });

    root.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      stop();
    });
    root.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "touch") return;
      start();
    });
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", (event) => {
      if (!root.contains(event.relatedTarget)) start();
    });

    let startX = 0;
    root.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      startX = event.clientX;
      stop();
    });
    root.addEventListener("pointerup", (event) => {
      if (event.target.closest("button")) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
      start();
    });

    window.addEventListener("resize", () => {
      window.clearTimeout(failSafe);
      busy = false;
      queued = 0;
      moveId += 1;
      parkClone();
      apply(false);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    const section = root.closest(".folio-row") || root;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const bounds = entry.rootBounds;
      const viewportH = bounds && bounds.height ? bounds.height : window.innerHeight;
      const cover = viewportH > 0 ? entry.intersectionRect.height / viewportH : 0;
      inView = entry.intersectionRatio >= 0.7 || cover >= 0.7;
      if (inView) start();
      else stop();
    }, { threshold: [0, 0.25, 0.5, 0.7, 0.85, 1] });
    observer.observe(section);

    apply(false);
  });
})();
