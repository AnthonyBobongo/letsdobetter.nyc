(function () {
  'use strict';
  let isScrolling = false;
  let menuExpanded = false;
  let current;
  let sections = [];

  const logo = document.querySelector(".main-header-logo");
  const nav = document.querySelector(".main-header nav");
  const menu = document.getElementById('menu');
  const menuButton = document.getElementById('menu-button');

  // Helpers
  function querySelectorAll(el, query) {
    const elements = [];
    for (let element of el.querySelectorAll(query)) {
      elements.push(element);
    }
    return elements;
  }

  // Animations
  function textAnimate(el, start, end, duration) {
    let startTimestamp;
    const step = function(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      el.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
  
  function startTextAnimation(el) {
    if (el.dataset.animationValue) {
      el.innerHTML = "0";
      textAnimate(el, 0, el.dataset.animationValue, 1000);
    }
  }

  // Sections
  function areEqual(a, b) {
    if (!a || !a.element) return false;
    if (!b || !b.element) return false;
    return a.element.id === b.element.id;
  }

  function setupSections() {
    let sectionIndex = 0;
    for (const section of document.getElementsByTagName('section')) {
      section.style.opacity = 0;
      section.style.zIndex = 0;

      const steps = querySelectorAll(section, '.step');
      if (steps.length) {
        for (let i = 0; i < steps.length; i++) {
          sections.push({
            index: sectionIndex++,
            element: section,
            step: i,
          });
        }
      } else {
        sections.push({
          index: sectionIndex++,
          element: section,
        });
      }
    }
  }

  function showSection(section) {
    const element = section && section.element;
    if (!element) return;

    element.style.transitionDuration = '0s';
    element.style.zIndex = 2;
    element.style.opacity = 1;

    updateHeader(element);
  }

  function activateSection(section) {
    const element = section && section.element;
    if (!element) return;

    for (const anim of element.querySelectorAll('.anim')) {
      anim.classList.add('animate');
    }

    for (const anim of element.querySelectorAll('.text-anim')) {
      startTextAnimation(anim);
    }

    if (section.step != undefined) {
      for (let i = 0; i < 5; i++) {
        element.classList.remove('step-' + i);
      }
      element.classList.add('step-' + section.step);
    }
  }

  function hideSection(section) {
    const element = section && section.element;
    if (!element) return;

    element.style.transitionDuration = '1s';
    element.style.zIndex = 3;
    element.style.opacity = 0;

    for (const anim of element.querySelectorAll('.anim')) {
      setTimeout(function() {
        anim.classList.remove('animate');
        element.style.zIndex = 0;
      }, 1000);
    }
  }

  // Transisitons
  function transitionTo(index) {
    const section = sections[index];
    if (!section) return;

    if (!areEqual(section, current)) {
      showSection(section);
      hideSection(current);
    }

    activateSection(section);

    current = section;
  }

  function transitionNext() {
    if (!current) return 0;
    const index = current.index + 1;
    if (index > sections.length) return;
    transitionTo(index);
  }

  function transitionPrev() {
    if (!current) return 0;
    const index = current.index - 1;
    if (index < 0) return;
    transitionTo(index);
  }

  function transitionToHash() {
    for (const section of sections) {
      if (section.element.id === location.hash.substring(1)) {
        closeMenu();
        transitionTo(section.index);
        return;
      }
    }
  }

  // Header
  function updateHeader(element) {
    const style = getComputedStyle(element);
    const image = style.getPropertyValue('--logo-image');
    const color = style.getPropertyValue('--header-color');
    logo.style.backgroundImage = image;
    nav.style.setProperty('--header-color', color);
  }

  function openMenu() {
    menuButton.innerHTML = "Close";
    menu.classList.add('expanded');
    nav.classList.add('no-items');
    menuExpanded = true;
    updateHeader(menu);
  }

  function closeMenu() {
    menuButton.innerHTML = 'Menu';
    menu.classList.remove('expanded');
    nav.classList.remove('no-items');
    menuExpanded = false;
    if (current && current.element) {
      updateHeader(current.element);
    }
  }

  // Events
  document.addEventListener('wheel', function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isScrolling) {
      isScrolling = true;
      if (e.deltaY > 0) {
        transitionNext();
      } else {
        transitionPrev();
      }

      setTimeout(function() {
        isScrolling = false;
      }, 1500);
    }

    return false;
  }, {
    passive: false
  });

  document.addEventListener('keydown', function(e) {
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      transitionNext();
      return false;
    }

    if (e.code === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      transitionPrev();
      return false;
    }
  });

  menuButton.addEventListener('click', function() {
    if (menuExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  window.addEventListener('hashchange', function() {
    transitionToHash();
  });

  // Init
  setupSections();

  if (location.hash) {
    transitionToHash();
  } else {
    transitionTo(0);
  }
})();
