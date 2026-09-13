document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero slideshow ---------- */
  var slideshow = document.getElementById("hero-slideshow");
  if (slideshow) {
    var slides = slideshow.querySelectorAll("img");
    if (slides.length > 1) {
      var current = 0;
      setInterval(function () {
        slides[current].classList.remove("active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("active");
      }, 6000);
    }
  }

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 60, 360) + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  document.querySelectorAll("form.lead-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var card = form.closest(".form-card");
      var status = form.querySelector(".form-status");
      var submitBtn = form.querySelector("button[type='submit']");
      var endpoint = form.getAttribute("action");

      if (!endpoint || endpoint.indexOf("YOUR_FORM_ID") !== -1) {
        status.textContent = "This form isn't connected to a backend yet — replace the Formspree endpoint in this file to enable it.";
        status.className = "form-status show error";
        return;
      }

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Sending…";

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            if (card) {
              var successHTML =
                '<div class="success-block">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>' +
                "<h4>Received</h4>" +
                "<p>Thank you — we'll be in touch shortly to get things moving.</p>" +
                "</div>";
              form.outerHTML = successHTML;
            }
          } else {
            return response.json().then(function (data) {
              throw new Error(
                data && data.errors ? data.errors.map(function (e) { return e.message; }).join(", ") : "Something went wrong. Please try again."
              );
            });
          }
        })
        .catch(function (err) {
          status.textContent = err.message || "Something went wrong. Please try again.";
          status.className = "form-status show error";
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  });
});
