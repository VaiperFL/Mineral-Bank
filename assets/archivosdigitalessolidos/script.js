// ************ GLOBAL CONSTANTS script.js************

// Case specific variables
let isGoogleDocs = window.location.href.includes("docs.google.com");
let isGmail = window.location.href.includes("mail.google.com");
let isJqueryLoaded = false;

// Only add for supporteds cases
if (isGoogleDocs || isGmail) {
  // USER VARIABLES
  let userId;
  let userEmail;
  let accessToken;

  // add listener for disableOnSite from content script
  window.addEventListener("disableOnSite", (evt) => {
    disabledOnSite = true;
    localStorage.setItem("PENORA_DISABLED_ON_SITE", true);
    removeAllIconsFromDocument();
  });

  // add listener for enableOnSite from content script
  window.addEventListener("enableOnSite", (evt) => {
    disabledOnSite = false;
    localStorage.removeItem("PENORA_DISABLED_ON_SITE");
    addAllIconsToSite();
  });

  // listener to receive userId and userEmail
  window.addEventListener("resultGetUserIdEmail", (evt) => {
    // Store them in global variables above for mixpanel
    userId = evt.detail.userId;
    userEmail = evt.detail.userEmail;
    accessToken = evt.detail.accessToken;

    if (mixpanel && userId && userEmail) {
      mixpanel.identify(userId);
      mixpanel.people.set({ $name: userId, $email: userEmail });
    }
  });

  // App constants
  const EXTENSION_ID = "namibaeakmnknolcnomfdhklhkabkchl";
  let BACKEND_URL = "https://penora-ai.herokuapp.com";
  // BACKEND_URL = "http://localhost:5001";
  // URL of where the AI routes are
  const BACKEND_AI_URL = `${BACKEND_URL}/ai/api`;

  // Floating Icon Parameters
  const ICON_TOP_REM_OFFSET = -1.5;
  const ICON_LEFT_REM_OFFSET = -4;
  const ICON_WIDTH = "25px";
  const ICON_HEIGHT = "25px";
  const ICON_DIV_ID = "penora-ai-icon-div";
  const IMG_ICON_ID = "penora-ai-icon";
  const ICON_SRC = `chrome-extension://${EXTENSION_ID}/logo.png`;
  const ICON_HTML =
    `
      <div class="penora-navlink">
        <div class="penora-innerText" style="margin-bottom: 8rem; margin-left: 0.2rem; margin-right: 0px; width: 12rem; font-size: 0.75rem;">
          <p>CTRL + Q => Open Extension </p>
          <p>CTRL + SHIFT + Q => Write next sentence </p>
          <p>CTRL + SHIFT + W => Write next paragraph </p>
        </div>
        <img class='penora-icon-bottom-right' id='${IMG_ICON_ID}' style='width:${ICON_WIDTH};height:${ICON_HEIGHT};' src='${ICON_SRC}'/>
      </div>
    `;

  // Main Popup Modal Parameters
  const MODAL_MAX_WIDTH = 400;
  const MODAL_MAX_HEIGHT = 282;
  // general offset
  const MODAL_HEIGHT_OFFSET = 3;
  // modal offset for inserting at element
  const MODAL_HEIGHT_OFFSET_V2 = 20;
  // modal offset for mouse Y
  const MODAL_MOUSE_Y_OFFSET = 20;
  const MODAL_LEFT_OFFSET = 0;
  const MODAL_ID = "penora-ai-modal";
  const MODAL_CLASS = "penora-ai-modal";
  let MODAL_INNER_HTLML;
  fetch(`chrome-extension://${EXTENSION_ID}/content/penora-modal.html`)
    .then((response) => response.text())
    .then((text) => (MODAL_INNER_HTLML = text));

  let MODAL_CSS;
  fetch(`chrome-extension://${EXTENSION_ID}/style/penora-ai-style.css`)
    .then((response) => response.text())
    .then((text) => (MODAL_CSS = text));

  // Toolbar Modal Parameters
  let TOOLBAR_MODAL_INNER_HTML;
  fetch(`chrome-extension://${EXTENSION_ID}/content/penora-toolbar-modal.html`)
    .then((response) => response.text())
    .then((text) => (TOOLBAR_MODAL_INNER_HTML = text));

  // Parameters to accomodate edge cases
  const VALID_ELEMENT_CLASS_NAMES = [
    "mce-content-body vtbegenerated mceContentBody",
    "whenContentEditable",
  ];
  const GOOGLE_DOCS_IFRAME_ID = "docs-texteventtarget-iframe";

  // ************ GLOBAL VARIABLES ************

  const INJECTED_MODAL_SUPPORTED_DOMAINS = [
    "docs.google.com",
    "mail.google.com",
    "yellowdig.com",
  ];

  let onSupportedDomain = false;
  let disabledOnSite = false;

  // Modal
  let prevModalId = "";
  let modalCount = 0;
  let currModalTop = 0;
  let currModalLeft = 0;
  let switchingModals = false;
  let modalShadowRoot = null;

  // Mouse:
  // curr pos
  let mouseX = -1;
  let mouseY = -1;
  // last click pos
  let mouseClickX, mouseClickY;

  // Previous focused element
  let previousFocusedElement = null;

  // Text
  let currSelectedText = "";
  let previousAddedText = "";

  // Google Docs text logic
  // The text behind the mouse click
  let googleDocsTextBehind = '';
  // Used for recalculating text behind for arrow up
  let secondToLastSentenceElement = null;
  // Used for recalculating text behind for arrow down
  let frontSentenceElement = null;

  let isNotion = false;

  // Templates
  let currTemplate;

  // CTRL + SHIFT + Q
  let generatingNextSentence = false;

  // CTRL + SHIFT + W
  let generatingNextParagraph = false;



  // ************ INITIALIZATION ************

  // MIXPANEL function

  (function (f, b) {
    if (!b.__SV) {
      var e, g, i, h;
      window.mixpanel = b;
      b._i = [];
      b.init = function (e, f, c) {
        function g(a, d) {
          var b = d.split(".");
          2 == b.length && ((a = a[b[0]]), (d = b[1]));
          a[d] = function () {
            a.push([d].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        var a = b;
        "undefined" !== typeof c ? (a = b[c] = []) : (c = "mixpanel");
        a.people = a.people || [];
        a.toString = function (a) {
          var d = "mixpanel";
          "mixpanel" !== c && (d += "." + c);
          a || (d += " (stub)");
          return d;
        };
        a.people.toString = function () {
          return a.toString(1) + ".people (stub)";
        };
        i =
          "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(
            " "
          );
        for (h = 0; h < i.length; h++) g(a, i[h]);
        var j = "set set_once union unset remove delete".split(" ");
        a.get_group = function () {
          function b(c) {
            d[c] = function () {
              call2_args = arguments;
              call2 = [c].concat(Array.prototype.slice.call(call2_args, 0));
              a.push([e, call2]);
            };
          }
          for (
            var d = {},
            e = ["get_group"].concat(Array.prototype.slice.call(arguments, 0)),
            c = 0;
            c < j.length;
            c++
          )
            b(j[c]);
          return d;
        };
        b._i.push([e, f, c]);
      };
      b.__SV = 1.2;
      e = f.createElement("script");
      e.type = "text/javascript";
      e.async = !0;
      e.src =
        "chrome-extension://namibaeakmnknolcnomfdhklhkabkchl/chrome-popup/mixpanel-2-latest.min.js";
      g = f.getElementsByTagName("script")[0];
      g.parentNode.insertBefore(e, g);
    }
  })(document, window.mixpanel || []);

  // Init mixpanel
  mixpanel.init("6a314f766eb4e703b699e61380eb5499", {
    debug: false,
    ignore_dnt: true,
  });

  // Identify on mixpanel
  window.dispatchEvent(new CustomEvent("getUserIdEmail"));


  // Google Docs initialization
  if (!window["_docs_force_html_by_ext"]) window["_docs_force_html_by_ext"] = "pebbhcjfokadbgbnlmogdkkaahmamnap";


  // IMPORTANT: CORE LOAD FUNCTION THAT SHOULD INITIALIZE EVERYTHING
  // WIP: some things may be initialized outside of this function
  window.onload = function () {
    // Check if on supported domain
    onSupportedDomain = INJECTED_MODAL_SUPPORTED_DOMAINS.some((domain) => {
      if (window.location.href.includes(domain)) {
        return true;
      }
    });

    // Check if disabled on site
    if (localStorage.getItem("PENORA_DISABLED_ON_SITE")) {
      disabledOnSite = true;
    }

    // Set Google Docs
    if (window.location.href.includes("docs.google.com/document")) {
      isGoogleDocs = true;
    }

    // add listener for insertTextIntoDocument from content script
    window.addEventListener("insertTextIntoDocument", (evt) => {
      handleInsertTextReqFromContentScript(evt.detail.text);
    });

    if (window.jQuery) {
      // jQuery is already loaded
      isJqueryLoaded = true;

      // Add functionalities
      addFunctionalitiesAfterJQueryLoaded();
    } else {
      // jQuery is not loaded
      // console.log("jQuery is not loaded");

      // see if current url is gmail
      const url = window.location.href;

      // see if url is gmail
      const isGmail = url.includes("mail.google.com");

      if (isGmail || isGoogleDocs) {

        // Add jquery
        var f = document.createElement("script");
        f.src = `chrome-extension://${EXTENSION_ID}/scripts/jquery-3.1.1.min.js`;
        f.onload = function () {
          // JQUERY loaded in
          this.remove();

          isJqueryLoaded = true;

          // Add functionalities after loading in
          addFunctionalitiesAfterJQueryLoaded();
        };
        (document.head || document.documentElement).appendChild(f);

      }
    }
  };

  const addFunctionalitiesAfterJQueryLoaded = () => {
    // Add Google Docs functionality
    addGoogleDocsFunctionality();

    addWindowListeners();
  };

  // Insert text into current document if the content script sends a request
  const handleInsertTextReqFromContentScript = (text) => {
    if (isGoogleDocs) {
      // googledocs
      addTextToGoogleDoc(text);
    } else if (isNotion) {
      // replace all new line characters with empty
      const textToInsert = text.replace(/^\s+|\s+$/g, "");
      document.execCommand("insertText", false, textToInsert);
    } else if (document.activeElement == null) {
      return;
    } else if (
      document.activeElement.tagName == "INPUT" ||
      document.activeElement.tagName == "TEXTAREA"
    ) {
      // input or textarea
      document.activeElement.value = document.activeElement.value + text;
    } else if (
      document.activeElement.tagName == "DIV" &&
      document.activeElement.contentEditable == "true" &&
      document.activeElement.getAttribute("role") == "textbox"
    ) {
      // For normal div / textboxes
      document.execCommand("insertText", false, text);
    } else {
      console.error("No type of input field matching found");
    }

    // Set this text as the previous added in case of deletion
    previousAddedText = text;
  };

  // Capture mouse events
  (function () {
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
      event = event || window.event;
      mouseX = event.clientX;
      mouseY = event.clientY;
    }
  })();

  // ************ UTIL FUNCTIONS ************

  /**
   * Sends a message to the content script
   * to request data and then retrieves the data
   * and resolves the requested data
   */
  var ChromeRequest = (function () {
    // For matching outgoing message with incoming message
    var requestId = 0;

    // gets data from content script
    function getData(url, payload) {
      // increment id
      var id = requestId++;

      // generate a new promise
      return new Promise(function (resolve, reject) {
        // listen for incoming messages from content script
        var listener = function (evt) {
          // check if the message is for this request
          if (evt.detail.requestId == id) {
            // Deregister self
            window.removeEventListener(
              "resultOfRequestFromContentScript",
              listener
            );
            resolve(evt.detail.data);
          }
        };

        window.addEventListener("resultOfRequestFromContentScript", listener);

        const message = { url, payload, id };

        window.dispatchEvent(
          new CustomEvent("placeRequestFromContentScript", { detail: message })
        );
      });
    }

    return { getData: getData };
  })();

  /**
   * Wrapper to make a post request
   * On error, retries by making a post request from the content script
   * @param {*} url
   * @param {*} payload
   * @param {*} useBackground
   * @returns
   */
  function makePostRequest(url, payload, useBackground = false) {
    // use content script to make request to get userId
    return ChromeRequest.getData(url, payload);
    // if (useBackground || isNotion) {
    //   return ChromeRequest.getData(url, payload);
    // }
    // return $.post(url, payload)
    //   .then((data) => data)
    //   .catch((err) => {
    //     // On error automatically try with chrome request
    //     return ChromeRequest.getData(url, payload);
    //   });
  }

  // OP function that gets the element at the cursor
  // Not tested for iframe
  function getElemAtCursor() {
    const elem = getSelection().getRangeAt(0).commonAncestorContainer;
    return elem.nodeType === 1 ? elem : elem.parentNode;
  }

  // Convert Rem (RM) -> Pixels (PX)
  function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  // Hide all penora-loader
  function hideAllLoaders() {
    const document = getModalWrapper();

    const loaders = document.querySelectorAll(".penora-loader");
    for (let i = 0; i < loaders.length; i++) {
      loaders[i].style.display = "none";
    }
  }

  // Show all penora-loader
  function showAllLoaders() {
    const document = getModalWrapper();

    const loaders = document.querySelectorAll(".penora-loader");
    for (let i = 0; i < loaders.length; i++) {
      loaders[i].style.display = "block";
    }
  }

  // Disable all buttons
  function disableAllButtons() {
    const document = getModalWrapper();

    const buttons = document.querySelectorAll(".penora-button");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }

  function isMacintosh() {
    return navigator.platform.indexOf("Mac") > -1;
  }

  function isWindows() {
    return navigator.platform.indexOf("Win") > -1;
  }

  function getCmdZEvent() {
    let cmdZEvent;

    if (isMacintosh) {
      cmdZEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        keyCode: 90,
        char: 90,
        metaKey: true,
      });
    } else {
      cmdZEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        keyCode: 90,
        char: 90,
        ctrlKey: true,
      });
    }

    return cmdZEvent;
  }

  const getModalWrapper = (customDocument = document) => {
    if (isGoogleDocs) {
    }
    let shadowEle = customDocument.querySelector(`#${prevModalId}`).shadowRoot;
    return shadowEle;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // ************ TEXT INSERTION ************

  const insertTextIntoFocusedElement = (
    text,
    customDocument,
    isIframe,
    useMousePosition = false,
    shouldAddModal = true
  ) => {
    if (isGoogleDocs) {
      // googledocs
      addTextToGoogleDoc(text);
    } else if (isNotion) {
      // replace all new line characters with empty
      const textToInsert = text.replace(/^\s+|\s+$/g, "");
      customDocument.execCommand("insertText", false, textToInsert);
    } else if (previousFocusedElement == null) {
      return;
    } else if (
      previousFocusedElement.tagName == "INPUT" ||
      previousFocusedElement.tagName == "TEXTAREA"
    ) {
      // input or textarea
      previousFocusedElement.value = previousFocusedElement.value + text;
    } else if (
      previousFocusedElement.tagName == "DIV" &&
      previousFocusedElement.contentEditable == "true" &&
      previousFocusedElement.getAttribute("role") == "textbox"
    ) {
      customDocument.execCommand("insertText", false, text);
    } else {
      console.error("No type of input field matching found");
    }

    // Set this text as the previous added in case of deletion
    previousAddedText = text;

    if (shouldAddModal) {
      // Add toolbar modal
      insertModal(
        currModalTop,
        currModalLeft,
        customDocument,
        isIframe,
        2,
        (useMousePosition = false)
      );
    }
  };

  const deleteTextFromFocusedElement = (customDocument, isIframe) => {
    if (isGoogleDocs) {
      // googledocs
      removeTextFromGoogleDoc(previousAddedText);
    } else if (previousFocusedElement == null) return;
    // Determine what type of input it is
    else if (
      previousFocusedElement.tagName == "INPUT" ||
      previousFocusedElement.tagName == "TEXTAREA"
    ) {
      // input / textarea
      previousFocusedElement.value = previousFocusedElement.value.slice(
        0,
        -previousAddedText.length
      );
    } else if (
      previousFocusedElement.tagName == "DIV" &&
      previousFocusedElement.contentEditable == "true" &&
      previousFocusedElement.getAttribute("role") == "textbox"
    ) {
      // div input

      // undo add text
      document.execCommand("undo", false, null);
    }
  };

  // ************ MODAL FUNCTIONS ************

  // Helper function to close the modal
  const closeModal = () => {
    if (prevModalId.length > 0) {
      document.getElementById(prevModalId).remove();
      prevModalId = "";

      // add focus back to previous focused element
      if (previousFocusedElement != null) {
        previousFocusedElement.focus();
      }
    }
  };

  /**
   * Calculates and adds a modal for a normal HTML / iframe document
   * @param {*} customDocument - for iframes
   * @param {*} isIframe - for iframes
   */
  const addModalBelowSelectedText = (customDocument = null, isIframe = false) => {
    if (!doesIconAlreadyExist(customDocument)) return; // if no icon, don't add
    if (customDocument == null) customDocument = document;

    const selection = customDocument.getSelection();
    const selectedText = selection.toString();
    currSelectedText = selectedText;
    const range = selection.getRangeAt(0);
    let selectedElement = range; //.startContainer.parentElement;

    // close any other open modals
    closeModal();

    // Calcualte modal positioning by calculating top and left offsets
    let top = `${selectedElement.getBoundingClientRect().top +
      window.scrollY +
      selectedElement.getBoundingClientRect().height +
      MODAL_HEIGHT_OFFSET
      }px`;
    let left = `${selectedElement.getBoundingClientRect().left + MODAL_LEFT_OFFSET
      }px`;

    // Check if chosen bounding rect was valid
    if (selectedElement.getBoundingClientRect().width == 0) {
      const ACTIVE_ELEMENT_LEFT_OFFSET = 10;
      selectedElement = customDocument.activeElement;

      top = `${selectedElement.getBoundingClientRect().top +
        window.scrollY +
        MODAL_HEIGHT_OFFSET
        }px`;
      left = `${selectedElement.getBoundingClientRect().left +
        ACTIVE_ELEMENT_LEFT_OFFSET +
        MODAL_LEFT_OFFSET
        }px`;
    }

    // Check if modal is out of bounds from bottom of screen
    if (
      parseInt(top) + parseInt(MODAL_MAX_HEIGHT) >
      customDocument.documentElement.clientHeight
    ) {
      top = `${customDocument.documentElement.clientHeight - parseInt(MODAL_MAX_HEIGHT)
        }px`;
    }

    // Check if modal is out of bounds from right of screen
    if (
      parseInt(left) + parseInt(MODAL_MAX_WIDTH) >
      customDocument.documentElement.clientWidth
    ) {
      left = `${customDocument.documentElement.clientWidth - parseInt(MODAL_MAX_WIDTH)
        }px`;
    }

    insertModal(top, left, customDocument, isIframe);
  };

  const closeModalWhenClickedOutSide = (event) => {
    if (prevModalId.length == 0) return;
    // if penora loader is there, then we want to skip closing modal when click outside
    if (document.getElementById("penora-loader") != null) return;
    if (event.target.closest("#" + prevModalId) == null && !switchingModals) {
      closeModal();
    }
    // if switching modals mode was enabled, disable it
    switchingModals = false;
  };

  /**
   * Calculates and adds the modal below the currently selected text in Google Docs
   * @param {*} customDocument
   * @param {*} isIframe
   */
  const addModalBelowGoogleDocSelection = (customDocument, isIframe) => {
    const selectedText = getSelectedTextGoogleDocs();
    const selectionRect = getSelectedRectGoogleDocs();

    currSelectedText = selectedText;

    // close any other open modals
    closeModal();

    let top;
    let left;

    if (selectedText.length == 0) {
      // when no text is selected
      // TODO: add better modal positioning when no text is selected

      top = `${mouseY + MODAL_MOUSE_Y_OFFSET}px`;
      left = `${mouseX}px`;
    } else {
      // Calcualte modal positioning by calculating top and left offsets
      top = `${selectionRect.top +
        window.scrollY +
        selectionRect.height +
        MODAL_HEIGHT_OFFSET
        }px`;
      left = `${selectionRect.left + MODAL_LEFT_OFFSET}px`;
    }

    insertModal(top, left, customDocument, isIframe);
  };

  const addModalToElementAtCursor = (customDocument = null, isIframe = false) => {
    if (!doesIconAlreadyExist(customDocument)) return; // if no icon, don't add
    if (customDocument == null) customDocument = document;

    const currElement = getElemAtCursor();

    // close any other open modals
    closeModal();

    // Calcualte modal positioning by calculating top and left offsets
    let top = `${currElement.getBoundingClientRect().top +
      currElement.getBoundingClientRect().height +
      window.scrollY +
      MODAL_HEIGHT_OFFSET_V2
      }px`;
    let left = `${currElement.getBoundingClientRect().left + MODAL_LEFT_OFFSET
      }px`;

    // Check if modal is out of bounds from bottom of screen
    if (
      parseInt(top) + parseInt(MODAL_MAX_HEIGHT) >
      customDocument.documentElement.clientHeight
    ) {
      top = `${customDocument.documentElement.clientHeight - parseInt(MODAL_MAX_HEIGHT)
        }px`;
    }

    // Check if modal is out of bounds from right of screen
    if (
      parseInt(left) + parseInt(MODAL_MAX_WIDTH) >
      customDocument.documentElement.clientWidth
    ) {
      left = `${customDocument.documentElement.clientWidth - parseInt(MODAL_MAX_WIDTH)
        }px`;
    }

    insertModal(top, left, customDocument, isIframe);
  };

  /**
   * Add listeners for the QA tab in Modal
   */
  const addRewriteListeners = (customDocument, isIframe, modalWrapper) => {
    // add click to listener to "penora-qa-answer-button" div
    modalWrapper
      .getElementById("penora-rewrite-button")
      .addEventListener("click", () => {
        // Show loading & disable all buttons
        showAllLoaders();
        disableAllButtons();

        // use the curr selected text as the query
        const query = currSelectedText;

        const length = modalWrapper.getElementById(
          "penora-rewrite-length-select"
        ).value;

        const tone = modalWrapper.getElementById(
          "penora-rewrite-tone-input"
        ).value;

        // make jquery post request to backend
        makePostRequest(`${BACKEND_AI_URL}/rewrite`, { query, length, tone, accessToken })
          .then((response) => {

            // hide .penora-rewrite-prompt
            modalWrapper
              .querySelectorAll(".penora-rewrite-prompt")[0]
              .classList.add("penora-hidden");

            // remove penora-hidden class from .penora-rewrite-output
            modalWrapper
              .querySelectorAll(".penora-rewrite-output")[0]
              .classList.remove("penora-hidden");

            // for each response, create a new div and add it to the .penora-rewrite-output div
            response.forEach((item) => {
              const div = customDocument.createElement("div");
              const RESULT_HTML = `
                <div class="penora-row">
                  <p class="penora-output">
                    ${item}
                  </p>
                  <!-- TODO: if user presses copied icon, it should have small popup that says: Copied!                -->
                  <div class="penora-copy-rewrite-button" value="${item}">
                    <img src="chrome-extension://${EXTENSION_ID}/images/CheckCircle.svg" class="penora-question"/> </img>
                  </div>
                </div>
                <hr class="penora-divider solid" />
              `;
              div.innerHTML = RESULT_HTML;
              modalWrapper
                .querySelectorAll(".penora-rewrite-output")[0]
                .appendChild(div);
            });

            // add listener for copy buttons with class penora-copy-rewrite-button
            const copyButtons = modalWrapper.querySelectorAll(
              ".penora-copy-rewrite-button"
            );
            for (let i = 0; i < copyButtons.length; i++) {
              const item = copyButtons[i];

              item.addEventListener("click", () => {
                // copy the value to the clipboard
                closeModal();
                insertTextIntoFocusedElement(
                  response[i],
                  customDocument,
                  isIframe
                );
              });
            }

            // add back button functionality
            modalWrapper
              .querySelector(".penora-rewrite-back")
              .addEventListener("click", () => {
                // hide .penora-rewrite-output
                modalWrapper
                  .querySelectorAll(".penora-rewrite-output")[0]
                  .classList.add("penora-hidden");

                // remove penora-hidden class from .penora-rewrite-prompt
                modalWrapper
                  .querySelectorAll(".penora-rewrite-prompt")[0]
                  .classList.remove("penora-hidden");

                hideAllLoaders();
              });
          })
          .catch((err) => {
            console.log(err);
          });
      });
  };

  const handleTemplateGenerateButtonClick = (
    customDocument,
    isIframe,
    modalWrapper
  ) => {
    // Show loading & disable all buttons
    showAllLoaders();
    disableAllButtons();

    // outline inputs
    const outlineThesis = modalWrapper.getElementById(
      "penora-templates-thesis-input"
    ).value;
    const outlineTone = modalWrapper.getElementById(
      "penora-templates-tone-input"
    ).value;

    // response inputs
    const responseText = modalWrapper.getElementById(
      "penora-templates-response-textarea"
    ).value;
    const responseKeyInfo = modalWrapper.getElementById(
      "penora-templates-key-info-input"
    ).value;
    const responseTone = modalWrapper.getElementById(
      "penora-templates-response-tone-input"
    ).value;

    // intro inputs
    const introPoints = modalWrapper.getElementById(
      "penora-templates-intro-points-textarea"
    ).value;
    const introThesis = modalWrapper.getElementById(
      "penora-templates-intro-thesis-input"
    ).value;
    const introTone = modalWrapper.getElementById(
      "penora-templates-intro-tone-input"
    ).value;

    // conclusion inputs
    const conclusionPoints = modalWrapper.getElementById(
      "penora-templates-conclusion-points-textarea"
    ).value;
    const conclusionThesis = modalWrapper.getElementById(
      "penora-templates-conclusion-thesis-input"
    ).value;
    const conclusionTone = modalWrapper.getElementById(
      "penora-templates-conclusion-tone-input"
    ).value;

    // Depending on the currTemplate, collect different inputs and handle process
    switch (currTemplate) {
      case "outline":
        makePostRequest(`${BACKEND_AI_URL}/generate-outline`, {
          thesis: outlineThesis,
          tone: outlineTone,
          accessToken,
        })
          .then((response) => {
            closeModal();
            insertTextIntoFocusedElement(response, customDocument, isIframe);
          })
          .catch((err) => {
            console.log(err);
          });
        break;
      case "response":
        makePostRequest(`${BACKEND_AI_URL}/generate-response`, {
          query: responseText,
          info: responseKeyInfo,
          tone: responseTone,
          accessToken
        })
          .then((response) => {
            closeModal();
            insertTextIntoFocusedElement(response, customDocument, isIframe);
          })
          .catch((err) => {
            console.log(err);
          });
        break;
      case "intro":
        makePostRequest(`${BACKEND_AI_URL}/generate-intro`, {
          points: introPoints,
          thesis: introThesis,
          tone: introTone,
          accessToken
        })
          .then((response) => {
            closeModal();
            insertTextIntoFocusedElement(response, customDocument, isIframe);
          })
          .catch((err) => {
            console.log(err);
          });
        break;
      case "conclusion":
        makePostRequest(`${BACKEND_AI_URL}/generate-conclusion`, {
          points: conclusionPoints,
          thesis: conclusionThesis,
          tone: conclusionTone,
          accessToken
        })
          .then((response) => {
            closeModal();
            insertTextIntoFocusedElement(response, customDocument, isIframe);
          })
          .catch((err) => {
            console.log(err);
          });
        break;
      case "custom":
        makePostRequest(`${BACKEND_AI_URL}/generate-custom`, {
          points: customPoints,
          info: customBackgroundInfo,
          accessToken
        })
          .then((response) => {
            closeModal();
            insertTextIntoFocusedElement(response, customDocument, isIframe);
          })
          .catch((err) => {
            console.log(err);
          });
        break;
      default:
      // do nothing
    }
  };

  const addConchListeners = (customDocument, isIframe, modalWrapper) => {
    const conchButton = modalWrapper.querySelector(
      "#penora-conch-generate-button"
    );

    conchButton.addEventListener("click", () => {
      // Show loading & disable all buttons
      showAllLoaders();
      disableAllButtons();

      // get query from penora-conch-textarea text area
      const query = modalWrapper.querySelector("#penora-conch-textarea").value;

      makePostRequest(`${BACKEND_AI_URL}/generate-custom`, { query, accessToken })
        .then((response) => {
          closeModal();
          insertTextIntoFocusedElement(response, customDocument, isIframe);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };

  /**
   * Add listeners for template tab
   * @param {*} modalWrapper
   * @param {*} isIframe
   */
  const addTemplatesGenerateListeners = (
    customDocument,
    isIframe,
    modalWrapper
  ) => {
    // add listenrs to penora-template-option
    const templateOptions = modalWrapper.querySelectorAll(
      ".penora-template-option"
    );

    const sidebar = modalWrapper.getElementById("penora-sidebar");
    const tempContainer = modalWrapper.getElementById("penora-templates");
    for (let i = 0; i < templateOptions.length; i++) {
      const item = templateOptions[i];

      // get id of div to enable
      const templateType = item.getAttribute("value");
      const inputSectionId = "penora-" + templateType;

      item.addEventListener("click", () => {
        // set the curr template being handled
        sidebar.style.height = "280px";
        currTemplate = templateType;
        tempContainer.classList.remove("templatesLarge");
        tempContainer.classList.add("penora-tempLarge");
        // show the input section by enabling display
        modalWrapper.getElementById(inputSectionId).style.display = "block";

        // hide penora-templates-options-section
        modalWrapper.getElementById(
          "penora-templates-options-section"
        ).style.display = "none";
      });
    }

    // add click to listener to all "penora-templates-generate-button" div
    const generateButtons = modalWrapper.querySelectorAll(
      ".penora-templates-generate-button"
    );

    // Add the listener to each button
    for (let i = 0; i < generateButtons.length; i++) {
      const item = generateButtons[i];

      // Add click listener to each generate button part of a template
      item.addEventListener("click", () => {
        handleTemplateGenerateButtonClick(customDocument, isIframe, modalWrapper);
      });
    }

    // Add back button listener to #penora-templates-back-button
    const backButtons = modalWrapper.querySelectorAll(
      ".penora-templates-back-button"
    );

    for (let i = 0; i < backButtons.length; i++) {
      const backButton = backButtons[i];

      backButton.addEventListener("click", () => {
        sidebar.style.height = "218px";
        tempContainer.classList.remove("penora-tempLarge");
        tempContainer.classList.add("templatesLarge");
        // hide the input section by enabling display
        modalWrapper.getElementById("penora-" + currTemplate).style.display =
          "none";

        // show penora-templates-options-section
        modalWrapper.getElementById(
          "penora-templates-options-section"
        ).style.display = "flex";
      });
    }
  };

  /**
   * Add listeners for the QA tab in Modal
   */
  const addTLDRListeners = (customDocument, isIframe, modalWrapper) => {
    // add click to listener to "penora-qa-answer-button" div
    modalWrapper
      .querySelector("#penora-tldr-generate-button")
      .addEventListener("click", () => {
        // Show loading & disable all buttons
        showAllLoaders();
        disableAllButtons();

        // use the curr selected text as the query
        const query = currSelectedText;

        // tldr inputs
        const tldrLength = modalWrapper.getElementById(
          "penora-tldr-length-select"
        ).value;
        const tldrOutputGradeLevel = modalWrapper.getElementById(
          "penora-tldr-grade-level-input"
        ).value;

        // make jquery post request to backend
        makePostRequest(`${BACKEND_AI_URL}/generate-tldr`, {
          query,
          length: tldrLength,
          outputGradeLevel: tldrOutputGradeLevel,
          accessToken
        })
          .then((response) => {
            // hide .tldr-input-container
            modalWrapper.querySelector(
              ".penora-tldr-input-container"
            ).style.display = "none";

            // show .tldr-output-container
            modalWrapper.querySelector(
              ".penora-tldr-output-container"
            ).style.display = "block";

            // insert the text into #tldr-output-text
            modalWrapper.querySelector("#penora-tldr-output-text").innerHTML =
              response;

            // add back button functionality
            modalWrapper
              .querySelector("#penora-tldr-back-button")
              .addEventListener("click", () => {
                hideAllLoaders();

                // show .tldr-input-container
                modalWrapper.querySelector(
                  ".penora-tldr-input-container"
                ).style.display = "block";

                // hide .tldr-output-container
                modalWrapper.querySelector(
                  ".penora-tldr-output-container"
                ).style.display = "none";
              });

            // add copy button functionality
            modalWrapper
              .querySelector("#penora-tldr-copy-button")
              .addEventListener("click", () => {
                // copy the text to clipboard
                copyToClipboard(response);
                closeModal();
              });
          })
          .catch((err) => {
            console.log(err);
          });
      });
  };

  /**
   * Handle changing tabs in modal
   */
  const addTabChangeListener = () => {
    const document = getModalWrapper();

    const tabs = document.querySelectorAll("[data-tab-target]");
    const tabContents = document.querySelectorAll("[data-tab-content]");
    const tempContainer = document.getElementById("penora-templates");

    const sidebar = document.getElementById("penora-sidebar");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (
          tempContainer.classList.contains("penora-tempLarge") &&
          tab.dataset.tabTarget == "#penora-templates"
        ) {
          sidebar.style.height = "278px";
        } else {
          sidebar.style.height = "218px";
        }
        const target = document.querySelector(tab.dataset.tabTarget);
        tabContents.forEach((tabContent) => {
          tabContent.classList.remove("penora-nav-selected");
        });
        tabs.forEach((tab) => {
          tab.classList.remove("penora-nav-selected");
        });
        tab.classList.add("penora-nav-selected");
        target.classList.add("penora-nav-selected");
      });
    });
  };

  /**
   * Disable certain modal features
   * 1) if no curr selected text, disable rewrite and tldr
   * @param {*} customDocument
   * @param {*} isIframe
   */
  const disableModalFeatures = (customDocument, isIframe) => {
    const modalWrapper = getModalWrapper();
    if (!currSelectedText) {
      // disable the penora-tldr-generate-button and penora-rewrite-button
      const tldrGenerateButton = modalWrapper.getElementById(
        "penora-tldr-generate-button"
      );
      const rewriteButton = modalWrapper.getElementById("penora-rewrite-button");

      $("#penora-tldr-generate-button").attr("disabled", "disabled");
      $("#penora-rewrite-button").attr("disabled", "disabled");

      tldrGenerateButton.classList.add("penora-button-disabled");

      rewriteButton.classList.add("penora-button-disabled");

      // each element with class highlight-text-hint, set display to block
      const highlightTextHints = modalWrapper.querySelectorAll(
        ".highlight-text-hint"
      );
      for (let i = 0; i < highlightTextHints.length; i++) {
        highlightTextHints[i].style.display = "block";
      }
    }
  };

  // Just adds all the listeners above
  const addMainModalListeners = (customDocument, isIframe) => {
    let documentToUse = document;
    // If it's not a google docs and it's an iframe, use customDocument
    if (!isGoogleDocs && isIframe) documentToUse = customDocument;
    // Otherwise, use normal document

    // disable certain features
    disableModalFeatures(customDocument, isIframe);

    // Add all listeners for the main modal
    addTabChangeListener();
    addConchListeners(customDocument, isIframe, getModalWrapper());
    addTemplatesGenerateListeners(customDocument, isIframe, getModalWrapper());

    // Only if curr selected text, add these listeners
    if (currSelectedText) {
      addRewriteListeners(customDocument, isIframe, getModalWrapper());
      addTLDRListeners(customDocument, isIframe, getModalWrapper());
    }
  };

  const addToolbarModalListeners = (customDocument, isIframe) => {
    // These are added to the root HTML, so use document instead of contentDocument
    // contentDocument is simply passed to the modal / deleteText
    document
      .getElementById("penora-redo-button")
      .addEventListener("click", () => {
        // about to swi
        switchingModals = true;
        // delete text
        deleteTextFromFocusedElement(customDocument, isIframe);
        // open new modal
        insertModal(currModalTop, currModalLeft, customDocument, isIframe, 1);
      });

    // delete button listener
    document
      .getElementById("penora-delete-button")
      .addEventListener("click", () => {
        deleteTextFromFocusedElement(customDocument, isIframe);
        closeModal();
      });

    // done button listener
    document
      .getElementById("penora-done-button")
      .addEventListener("click", () => {
        closeModal();
      });
  };

  const addGenerateToolbarModalListeners = (customDocument, isIframe) => {
    // These are added to the root HTML, so use document instead of contentDocument
    // contentDocument is simply passed to the modal / deleteText
    try {
      const deleteButton = document.getElementById("penora-delete-button");
      const doneButton = document.getElementById("penora-done-button");

      // First delete listeners
      $(deleteButton).off();
      $(doneButton).off();

      // Then add listeners
      $(deleteButton).on("click", () => {
        mixpanel.track("deleteCtrlqOutput");
        deleteTextFromFocusedElement(customDocument, isIframe);
        closeModal();
      });

      $(doneButton).on("click", () => {
        mixpanel.track("checkCtrlqOutput");
        closeModal();

        // stimulate click on docs-texteventtarget-iframe
        if (isGoogleDocs) {
          document
            .querySelector(".docs-texteventtarget-iframe")
            .contentDocument.activeElement.focus();

          document.querySelector(".docs-texteventtarget-iframe").focus();
        }
      });
    } catch (err) {
      // console.log("error adding listeners");
    }
  };

  const addUpgradeToolbarListeners = (customDocument = null, isIframe = false) => {
    const closeButton = document.getElementById("penora-close-toolbar-button");
    $(closeButton).on("click", () => {
      closeModal();
    });
  };

  const openChromeToolbarModal = (data) => {
    // let keyEvent = new KeyboardEvent("keydown", {
    //   bubbles: true,
    //   cancelable: true,
    //   keyCode: 81,
    //   char: 81,
    //   ctrlKey: true,
    // });
    // document.dispatchEvent(keyEvent);
    // window.dispatchEvent(new CustomEvent("openModalFromContentScript", data));
  };

  const closeModalAfterTimeout = (
    customDocument = null,
    isIframe = false,
    timeout = 15000
  ) => {
    // auto close the modal after 5 seconds
    const CLOSE_TIME = timeout;

    setTimeout(() => {
      // Check if the Generate .penora-toolbar-wrapper exists
      if (customDocument.querySelector(".penora-toolbar-wrapper")) {
        // If it does, then we are in the toolbar modal
        closeModal();
      }
      // Otherwise, do not close anything
    }, CLOSE_TIME);
  };

  /**
   * Creats a Shadow Root Modal and injects it to the specified parentElement
   * as a child.
   * Why a shadow root? It's a useful technique that prevents outside CSS from
   * affecting elements inside the shadow root (so a webpage's CSS won't affect
   * our modal and creates a consistent look on all websites)
   * @param {*} parentElement
   * @param {*} MODAL_HTML
   * @param {*} NEW_MODAL_ID
   * @param {*} MODAL_CLASS
   * @param {*} top
   * @param {*} left
   */
  const injectShadowRoot = (
    parentElement,
    MODAL_HTML,
    NEW_MODAL_ID,
    MODAL_CLASS,
    top,
    left
  ) => {
    const sRoot = document.createElement("div");
    sRoot.id = `${NEW_MODAL_ID}`;
    sRoot.className = `${MODAL_CLASS}`;
    sRoot.style.top = `${top}px`;
    sRoot.style.left = `${left}px`;
    sRoot.attachShadow({ mode: "open" });
    if (sRoot?.shadowRoot) {
      sRoot.shadowRoot.innerHTML = `
        <style>
        :host {all: initial;}
        ${MODAL_CSS}
        </style>`;
    }
    const shadowDiv = document.createElement("div");
    shadowDiv.innerHTML = MODAL_HTML;
    sRoot.shadowRoot?.appendChild(shadowDiv);
    parentElement.appendChild(sRoot);
  };

  /**
   * Inserts the actual HTML into the page
   * @param {*} top
   * @param {*} left
   * @param {*} customDocument
   * @param {*} isIframe
   */
  const insertModal = (
    top,
    left,
    customDocument,
    isIframe,
    modalType = 1,
    useMousePosition = false,
    useCursorPosition = false
  ) => {
    // no inserting modals except toolbar ones
    if (!(modalType == 3 || modalType == 4)) return;


    closeModal();

    // If use mouse position
    if (useMousePosition) {
      top = mouseY;
      left = mouseX;
    }

    // Set prev modal positions
    currModalTop = top;
    currModalLeft = left;

    // Create and increment modal id
    const NEW_MODAL_ID = MODAL_ID + modalCount;
    modalCount++;

    let MODAL_HTML;

    if (modalType === 1) {
      MODAL_HTML = `
        <div id="${NEW_MODAL_ID}" class="${MODAL_CLASS}" style="top: ${top}; left: ${left};">
          ${MODAL_INNER_HTLML}
        </div>
      `;
    } else if (modalType === 2) {
      MODAL_HTML = `
        <div id="${NEW_MODAL_ID}" class="${MODAL_CLASS}" style="top: ${top}; left: ${left};">
          ${TOOLBAR_MODAL_INNER_HTML}
        </div>
      `;
    } else if (modalType === 3) {
      // show loading modal
      MODAL_HTML = `
        <div id="${NEW_MODAL_ID}" class="${MODAL_CLASS}" style="top: ${top}px; left: ${left}px;">
          <div class="penora-toolbar-wrapper">
            <div class="penora-toolbar-modal">
              <div class="penora-toolbar-row">
                <div id="penora-delete-button">
                  <i class="fa-solid fa-trash" style="color: #d80000"></i>
                </div>
                <div id="penora-done-button">
                  <i class="fa-regular fa-circle-check" style="color: #049a25"></i>
                </div>
              </div>
              <div class="penora-generate-loader"></div>
            </div>
          </div>
        </div>
      `;
    } else if (modalType == 4) {
      // show loading modal
      MODAL_HTML = `
        <div id="${NEW_MODAL_ID}" class="${MODAL_CLASS}" style="top: ${top}px; left: ${left}px;">
          <div class="penora-toolbar-wrapper">
            <div class="penora-toolbar-modal">
              <div class="penora-toolbar-row" style="font-size: 15px; font-weight: bold; padding: 0px">
                <div id="penora-close-toolbar-button">
                  <i class="fa-solid fa-close" style="color: #d80000"></i>
                </div>
                <div id="penora-done-button">
                  Out of tokens. <a
                  href="https://buildquest.notion.site/Conch-Cookbook-0c13af99cf9b4d42a4a5fab741352856"
                  target="_blank"
                > Please upgrade here. </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (!isIframe && modalType === 1) {
      injectShadowRoot(
        customDocument.body,
        MODAL_HTML,
        NEW_MODAL_ID,
        MODAL_CLASS,
        top,
        left
      );
    } else if (!isIframe) {
      // for the other frame types
      customDocument.body.insertAdjacentHTML("beforeend", MODAL_HTML);
    } else if (isIframe && modalType === 1) {
      // Iframe + main modal
      injectShadowRoot(
        customDocument.defaultView.parent.document.body,
        MODAL_HTML,
        NEW_MODAL_ID,
        MODAL_CLASS,
        top,
        left
      );
    } else {
      // Iframe + other modals
      const parentDocument = customDocument.defaultView.parent.document;
      parentDocument.body.insertAdjacentHTML("beforeend", MODAL_HTML);
    }

    // Open Chrome Toolbar Modal instead if not on supported domain
    if (!onSupportedDomain) {
      openChromeToolbarModal();
      return;
    }

    // Store this modal's id as the previous modal ID for deletion
    prevModalId = NEW_MODAL_ID;

    // Add listeners to modal
    if (modalType === 1) {
      addMainModalListeners(customDocument, isIframe);
    } else if (modalType === 2) {
      addToolbarModalListeners(customDocument, isIframe);
    } else if (modalType === 3) {
      addGenerateToolbarModalListeners(customDocument, isIframe);
    } else if (modalType === 4) {
      addUpgradeToolbarListeners(customDocument, isIframe);
    }
  };

  // ************ ICON FUNCTIONS ************

  const doesIconAlreadyExist = (customDocument = null) => {
    if (customDocument == null) customDocument = document; // Default to current document
    return customDocument.getElementById(ICON_DIV_ID) != null;
  };

  const removeIconFromDocument = (customDocument = null) => {
    if (customDocument == null) customDocument = document; // Default to current document
    const icon = customDocument.getElementById(ICON_DIV_ID);
    if (icon) {
      icon.remove();
    }
  };

  /**
   * For a given element, check if it is a valid element to add the icon to
   * @param {*} targetElem - element in question
   * @returns true or false
   */
  const matchesIconCriteria = (targetElem) => {
    return (
      targetElem.parentElement &&
      (targetElem.tagName === "INPUT" ||
        targetElem.role === "textbox" ||
        targetElem.tagName === "TEXTAREA" ||
        VALID_ELEMENT_CLASS_NAMES.includes(targetElem.className))
    );
  };

  const addIconToElement = (
    targetElem,
    isIframe = false,
    customDocument = null
  ) => {

    // If disabled on site, return immediately
    if (disabledOnSite) return;

    if (isGoogleDocs || isNotion) {
      // do nothing if google docs
    } else if (
      (targetElem.id && targetElem.id.startsWith("penora")) ||
      (targetElem.className && targetElem.className.startsWith("penora"))
    ) {
      // the element id or class begins with 'penora', skip
      return;
    } else if (!matchesIconCriteria(targetElem) && !isIframe && !isGoogleDocs) {
      // If it's not a valid element anymore
      // Remove icon as focus has shifted from the previous element
      removeIconFromDocument(customDocument);
    } else if (targetElem === previousFocusedElement && doesIconAlreadyExist()) {
      // Same element and icon already exists, skip adding icon
      return;
    } else {
      // Different element, remove icon from document and add new icon below
      previousFocusedElement = targetElem;
      removeIconFromDocument(customDocument);
    }
    // If the focused element matches our criteria, add an icon to it
    if (
      !doesIconAlreadyExist(customDocument) &&
      targetElem.parentElement &&
      (targetElem.role === "textbox" ||
        targetElem.tagName === "TEXTAREA" ||
        VALID_ELEMENT_CLASS_NAMES.includes(targetElem.className))
    ) {
      // Create an icon in bottom right
      const elem = document.createElement("div");
      elem.id = ICON_DIV_ID;
      elem.innerHTML = ICON_HTML;
      elem.style.position = "absolute";
      elem.style.zIndex = 9999;
      elem.style.cursor = "pointer";

      if (isIframe || isNotion) {
        // TODO: calculate these percentages based on the size of the iframe
        elem.style.bottom = "1%";
        elem.style.right = "7%";
      } else {
        // console.log(targetElem.getBoundingClientRect());
        // console.log(targetElem.getBoundingClientRect().top + window.scrollY + targetElem.getBoundingClientRect().height + convertRemToPixels(ICON_TOP_REM_OFFSET));
        // console.log(targetElem.getBoundingClientRect().right + window.scrollX + MODAL_LEFT_OFFSET);
        // Add Modal below selected text through mathematically calculating its position
        elem.style.top = `${targetElem.getBoundingClientRect().top +
          window.scrollY +
          targetElem.getBoundingClientRect().height +
          convertRemToPixels(ICON_TOP_REM_OFFSET)
          }px`;
        elem.style.left = `${targetElem.getBoundingClientRect().right +
          window.scrollX +
          convertRemToPixels(ICON_LEFT_REM_OFFSET)
          }px`;
      }

      // Add icon to DOM
      document.body.appendChild(elem);

      // Add listeners to icon
      addIconListeners(isIframe, customDocument);
    }
  };

  // Remove all Penora icons from site
  const removeAllIconsFromDocument = (customDocument = null) => {
    if (customDocument == null) customDocument = document; // Default to current document
    const icons = document.querySelectorAll(`#${ICON_DIV_ID}`);
    if (icons) {
      for (let i = 0; i < icons.length; i++) {
        icons[i].remove();
      }
    }
  };

  // Add back all Penora icons to site
  const addAllIconsToSite = (customDocument = null) => {
    if (isGoogleDocs) {
      const currIFrame = document.activeElement;
      if (currIFrame.contentDocument) {
        const documentDiv = currIFrame.contentDocument.querySelector("div");
        addIconToElement(documentDiv, true, currIFrame.contentDocument);
      }
    }
  };

  function addIconListeners(isIframe = false, customDocument = document) {
    const icons = document.querySelectorAll(`#${ICON_DIV_ID}`);
    if (icons) {
      for (let i = 0; i < icons.length; i++) {
        icons[i].addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          openChromeToolbarModal({});
        });
      }
    }
  }

  // ************ EVENT LISTENER FUNCTIONS ************

  // TOOD: will need to update for other websites besides GMail
  const getTextFromElement = (
    element,
    customDocument = null,
    isIframe = false
  ) => {
    if (isGoogleDocs) return getTextFromGoogleDocs();
    return element.textContent;
  };

  const getLast200CharactersFromText = (text) => {
    try {
      if (text.length > 200) {
        return text.substring(text.length - 200, text.length);
      } else {
        return text;
      }
    } catch (e) {
      return "";
    }
  };

  const showLoadingInToolbarModal = (customDocument = null, isIframe = false) => {
    if (customDocument == null) customDocument = document; // Default to current document

    // set .penora-generate-loader to display: block
    const loader = customDocument.getElementsByClassName(
      "penora-generate-loader"
    )[0];
    loader.style.display = "block";

    // hide .penora-toolbar-modal
    const modal = customDocument.getElementsByClassName("penora-toolbar-row")[0];
    modal.style.display = "none";
  };

  const hideLoadingInToolbarModal = (customDocument = null, isIframe = false) => {
    if (customDocument == null) customDocument = document; // Default to current document

    // set .penora-generate-loader to display: none
    const loader = customDocument.getElementsByClassName(
      "penora-generate-loader"
    )[0];

    loader.style.display = "none";

    // show .penora-toolbar-modal
    const modal = customDocument.getElementsByClassName("penora-toolbar-row")[0];
    modal.style.display = "flex";

    // Add listeners
    addGenerateToolbarModalListeners(customDocument, isIframe);
  };

  const generateSentence = (element, customDocument = null, isIframe = false) => {
    if (customDocument == null) customDocument = document; // Default to current document
    const currText = getTextFromElement(element, customDocument, isIframe);
    const last200Chars = getLast200CharactersFromText(currText);

    // Add loading modal
    insertModal(-1, -1, customDocument, isIframe, 3, true);
    showLoadingInToolbarModal();

    // Set generating to true
    generatingNextSentence = true;

    makePostRequest(`${BACKEND_AI_URL}/generate-sentence`, {
      query: last200Chars,
      accessToken
    })
      .then((response) => {
        // If out of tokens, show modal
        if (response == "Payment Required") {
          mixpanel.track("upgradePrompt-shown-ctrlShfitQ")
          insertModal(-1, -1, customDocument, isIframe, 4, true);
          return;
        }

        // Hide loading toolbar & show after generate options
        hideLoadingInToolbarModal();

        // Insert text
        insertTextIntoFocusedElement(
          response,
          customDocument,
          isIframe,
          true,
          false
        );

        // Close generate toolbar after timeout
        closeModalAfterTimeout(customDocument, isIframe);

        // Add response to google Docs Text Behind
        googleDocsTextBehind += ' ' + response;

        // Set generating to false
        generatingNextSentence = false;
      })
      .catch((error) => {
        console.error("Error generating next sentence: ", error);
        // Set generating to false
        generatingNextSentence = false;
        hideLoadingInToolbarModal();
      });
  };

  const generateParagraph = (
    element,
    customDocument = null,
    isIframe = false
  ) => {
    if (customDocument == null) customDocument = document; // Default to current document
    const currText = getTextFromElement(element, customDocument, isIframe);
    const last200Chars = getLast200CharactersFromText(currText);

    // Add loading modal
    insertModal(-1, -1, customDocument, isIframe, 3, true);
    showLoadingInToolbarModal();

    // Set generating to true
    generatingNextParagraph = true;

    makePostRequest(`${BACKEND_AI_URL}/generate-paragraph`, {
      query: last200Chars,
      accessToken
    }).then((response) => {
      // If out of tokens, show modal
      if (response == "Payment Required") {
        mixpanel.track("upgradePrompt-shown-ctrlShfitW")
        insertModal(-1, -1, customDocument, isIframe, 4, true);
        return;
      }

      // Hide loading toolbar & show after generate options
      hideLoadingInToolbarModal();

      // Insert text
      insertTextIntoFocusedElement(
        response,
        customDocument,
        isIframe,
        true,
        false
      );

      // Close generate toolbar after timeout
      closeModalAfterTimeout(customDocument, isIframe);

      // Add response to google Docs Text Behind
      googleDocsTextBehind += ' ' + response;

      // Set generating to false
      generatingNextParagraph = false;
    }).catch((error) => {
      console.error("Error generating next paragraph: ", error);
      // Set generating to false
      generatingNextParagraph = false;
      hideLoadingInToolbarModal();
    });
  };

  const handleHotKeysActions = (
    event,
    customDocument = null,
    isIframe = false,
    currIFrame = null,
    element
  ) => {

    // If disabled on site, return immediately
    if (disabledOnSite) return;

    // For google docs, append to the character behind on typing
    if (isGoogleDocs) {
      const char = event.shiftKey ? event.key : event.key.toLowerCase();
      const charForcomparison = char.toLowerCase();

      // rewrite the above array in one line
      const keysToIgnore = ["shift", "control", "alt", "meta", "capslock", "tab", "escape", "arrowleft", "arrowright", "enter", "backspace", "delete", "home", "end", "pageup", "pagedown", "insert", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"]

      if (keysToIgnore.includes(charForcomparison) || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        // do nothing
      } else if (charForcomparison == "backspace") {
        // remove last character
        googleDocsTextBehind = googleDocsTextBehind.substring(0, googleDocsTextBehind.length - 1);
      } else if (charForcomparison == "arrowup") {
        const newY = secondToLastSentenceElement.getBoundingClientRect().y + 0.5; // add 0.5 to make sure it's included
        getTextBehindMouseClickGoogleDocs(mouseClickX, newY);
      } else if (charForcomparison == "arrowdown") {
        const newY = frontSentenceElement.getBoundingClientRect().y + 0.5; // add 0.5 to make sure it's included
        getTextBehindMouseClickGoogleDocs(mouseClickX, newY);
      } else {
        // Add it to the text behind
        googleDocsTextBehind += char;
      }

    }

    // close modal on typing if not typing inside a modal component
    if (
      !event.target.id.startsWith("penora") &&
      !event.target.className.startsWith("penora")
    ) {
      // closeModal();
    }

    // CTRL+Q => Open Modal Below Selected Text
    if (event.ctrlKey && event.keyCode == 81 && !event.shiftKey) {
      // check if .kix-canvas-tile-selection exists (google doc)
      if (window.document.querySelector(".kix-canvas-tile-selection") != null) {
        // we're in a google doc
        addModalBelowGoogleDocSelection(customDocument, true);
      } else if (isNotion) {
        // Add elemnet at cursor for other cases: Notion,
        addModalToElementAtCursor(customDocument, isIframe);
      } else {
        // we're in a regular document
        addModalBelowSelectedText(customDocument, isIframe);
      }
    }

    // CTRL+SHIFT+Q => Generate sentence functionality
    if (
      event.ctrlKey &&
      event.shiftKey &&
      event.keyCode == 81 &&
      !generatingNextSentence
    ) {
      mixpanel.track("ctrlShiftQ");
      generateSentence(element, customDocument, isIframe);
    }
    // CTRL+SHIFT+W => Generate paragraph functionality
    if (event.ctrlKey && event.shiftKey && event.keyCode == 87 && !generatingNextParagraph) {
      generateParagraph(element, customDocument, isIframe);
    }
  };

  /**
   * Each time a user clicks something new, get what was clicked
   * Depending on what was clicked, then take certain actions
   */
  const handleWindowFocusChange = (
    event,
    isIframe = false,
    customDocument = null,
    currIFrame = null
  ) => {
    // google docs
    if (isGoogleDocs) return;

    // remove all keydown listeners from event.target
    $(event.target).off();

    // Add a jquery event listener to the event.target
    $(event.target).on("keydown", (keydownEvent) =>
      handleHotKeysActions(
        keydownEvent,
        customDocument,
        isIframe,
        currIFrame,
        event.target
      )
    );

    // Skip for certain pages
    addIconToElement(event.target, isIframe, customDocument);
  };

  // ************ ATTACH WINDOW LISTENERS ************

  function addWindowListeners() {

    const FOCUS_LISTENER_SUPPORTED_DOMAINS = ["mail.google.com"];

    // get site url
    const siteUrl = window.location.href;

    // check if this site is supported for this functionality
    let isSupported = false;
    for (let i = 0; i < FOCUS_LISTENER_SUPPORTED_DOMAINS.length; i++) {
      const domain = FOCUS_LISTENER_SUPPORTED_DOMAINS[i];
      if (siteUrl.includes(domain)) {
        isSupported = true;
        break;
      }
    }

    if (isSupported) {
      window.addEventListener("click", closeModalWhenClickedOutSide);
      window.onclick = closeModalWhenClickedOutSide();
      window.addEventListener("focus", handleWindowFocusChange, true);
    }
  }

  // ************ IFRAMES ************

  // const addListenersToAllIFrames = () => {
  //   var penoraIFrames = document.getElementsByTagName("iframe");
  //   for (var i = 0; i < frames.length; i++) {
  //     try {
  //       const currIFrame = penoraIFrames[i];
  //       // skip those without a content document
  //       if (currIFrame.contentDocument == null) continue;
  //       const frameWindow = currIFrame.contentDocument.body;
  //       frameWindow.addEventListener("click", closeModalWhenClickedOutSide);
  //       frameWindow.onclick = closeModalWhenClickedOutSide();
  //       frameWindow.addEventListener(
  //         "focus",
  //         (focusEvent) =>
  //           handleWindowFocusChange(
  //             focusEvent,
  //             true,
  //             currIFrame.contentDocument,
  //             currIFrame
  //           ),
  //         true
  //       );
  //       // TODO: if we want to listen to text
  //       // frameWindow.addEventListener("keypress", function (key) {
  //       //   console.log(key.key);
  //       //   let keyvalue = key.key;
  //       //   console.log("xxxSent key value");
  //       // });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // };

  // window.onload = () => {
  //   // For custom solutions
  //   if (isGoogleDocs) {
  //     return;
  //   }
  //   addListenersToAllIFrames();
  // };

  // ************ Google Docs ************
  // check if current url is google docs
  const addGoogleDocsFunctionality = () => {
    const url = window.location.href;
    if (url.includes("docs.google.com/document") && url.endsWith("/edit")) {
      isGoogleDocs = true;

      $(document).ready(function () {
        const currIFrame = document.getElementsByClassName("docs-texteventtarget-iframe")[0];
        const frameWindow = currIFrame.contentDocument.body;

        // upon loaded, then set things up

        frameWindow.addEventListener("click", closeModalWhenClickedOutSide);
        frameWindow.onclick = closeModalWhenClickedOutSide();

        // get the first div from the document
        const documentDiv = currIFrame.contentDocument.querySelector("div");

        // remove all keydown listeners from event.target
        $(documentDiv).off();

        addIconToElement(documentDiv, true, currIFrame.contentDocument);

        frameWindow.addEventListener("keydown", (keydownEvent) =>
          handleHotKeysActions(
            keydownEvent,
            currIFrame.contentDocument,
            true,
            currIFrame,
            documentDiv
          )
        );
      });
    }
  };

  const removeTextFromGoogleDoc = (text) => {
    let cmdZEvent = getCmdZEvent();

    var iframe = document.getElementsByClassName(
      "docs-texteventtarget-iframe"
    )[0];
    iframe.contentDocument.dispatchEvent(cmdZEvent);
  };

  const addTextToGoogleDoc = (text) => {

    const KEYS = text.split("");

    const keyEvent = document.createEvent("Event");
    keyEvent.initEvent("keypress", true, true);

    const docsElement = document.querySelector(".docs-texteventtarget-iframe")
      .contentDocument.activeElement;

    for (let i = 0; i < KEYS.length; i++) {
      const KEY = KEYS[i];

      // if this is the 2nd space in a row, press enter
      if (KEY == "\n") {
        const keyboardEvent = new KeyboardEvent("keydown", {
          code: "Enter",
          key: "Enter",
          charCode: 13,
          keyCode: 13,
          view: window,
          bubbles: true,
        });

        docsElement.dispatchEvent(keyboardEvent);
      } else {
        keyEvent.key = KEY; // A key like 'a' or 'B' or 'Backspace'

        // You will need to change this line if you want to use other special characters such as the left and right arrows
        keyEvent.keyCode = KEY.charCodeAt(0);

        docsElement.dispatchEvent(keyEvent);
      }
    }
  };

  function getPagesGoogleDocs() {
    try {
      // try to use jquery
      return $(".kix-page-paginated")
        .get()
        .map((page) => ({ page: page, top: page.getBoundingClientRect().top }))
        .sort((a, b) => a.top - b.top)
        .map((item) => item.page);
    } catch (error) {
      // if jquery is not available, use vanilla js
      return Array.from(document.querySelectorAll(".kix-page-paginated"))
        .map((page) => ({ page: page, top: page.getBoundingClientRect().top }))
        .sort((a, b) => a.top - b.top)
        .map((item) => item.page);
    }
  }

  function getCurrentlyVisiblePageGoogleDocs(pages) {
    try {
      const halfHeight = $(window).height() / 2;
      for (var i = pages.length - 1; i >= 0; i--)
        if (pages[i].getBoundingClientRect().top < halfHeight) return pages[i];
    } catch (error) {
      const halfHeight = window.innerHeight / 2;
      for (var i = pages.length - 1; i >= 0; i--)
        if (pages[i].getBoundingClientRect().top < halfHeight) return pages[i];
    }
  }

  function getSelectedRectGoogleDocs() {
    try {
      // try with jquery
      const page = getCurrentlyVisiblePageGoogleDocs(getPagesGoogleDocs());
      return $(".kix-canvas-tile-selection > svg > rect", page)
        .get()
        .map((el) => el.getBoundingClientRect())[0];
    } catch (error) {
      // if jquery is not available, use vanilla js
      const page = getCurrentlyVisiblePageGoogleDocs(getPagesGoogleDocs());
      const rects = Array.from(page.querySelectorAll(".kix-canvas-tile-selection > svg > rect"));
      return rects.map(el => el.getBoundingClientRect())[0];
    }
  }

  function getSelectedTextGoogleDocs() {
    const overlaps = (a, b) =>
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top;

    try {
      // try with jquery
      const page = getCurrentlyVisiblePageGoogleDocs(getPagesGoogleDocs());
      const selectionRects = $(".kix-canvas-tile-selection > svg > rect", page)
        .get()
        .map((el) => el.getBoundingClientRect());
      return $("svg > g[role=paragraph] > rect", page)
        .get()
        .map((el) => ({ el: el, rect: el.getBoundingClientRect() }))
        .filter((item) => selectionRects.some((rect) => overlaps(item.rect, rect)))
        .map((item) => item.el.getAttribute("aria-label"))
        .join(" ");
    } catch (error) {
      // try with vanilla js
      const page = getCurrentlyVisiblePageGoogleDocs(getPagesGoogleDocs());
      const selectionRects = Array.from(page.querySelectorAll(".kix-canvas-tile-selection > svg > rect")).map(el => el.getBoundingClientRect());
      return Array.from(page.querySelectorAll("svg > g[role=paragraph] > rect"))
        .map(el => ({ el: el, rect: el.getBoundingClientRect() }))
        .filter(item => selectionRects.some(rect => overlaps(item.rect, rect)))
        .map(item => item.el.getAttribute("aria-label"))
        .join(" ");
    }
  }


  const getTextBehindMouseClickGoogleDocs = (mouseX, mouseY) => {
    if (!isJqueryLoaded) return;

    // Reset elements
    googleDocsTextBehind = '';
    secondToLastSentenceElement = null;
    frontSentenceElement = null;

    // New text behind
    let newTextBehind = '';

    // Get google docs elements
    const page = getCurrentlyVisiblePageGoogleDocs(getPagesGoogleDocs());
    const sentences = $("svg > g[role=paragraph] > rect", page);

    const sentencesBehindMouseY = [];

    let lastAddedElemIndex = 0;

    // Get all the rects that are behind the mouse click
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const rect = sentence.getBoundingClientRect();
      if (rect.y < mouseY) {
        newTextBehind += sentence.getAttribute("aria-label");
        lastAddedElemIndex = i;
      }
    }

    // Update google docs text behind
    googleDocsTextBehind = newTextBehind;

    // Update second to last sentence element
    if (lastAddedElemIndex > 0 && lastAddedElemIndex < sentences.length - 1) {
      secondToLastSentenceElement = sentences[lastAddedElemIndex - 1];
    }
    // Add front sentence element
    if (lastAddedElemIndex <= sentences.length - 2) {
      frontSentenceElement = sentences[lastAddedElemIndex + 1];
    }

  }

  // Get mouse click positions for getting text calculations
  function printMousePos(event) {
    mouseClickX = event.clientX;
    mouseClickY = event.clientY;
    getTextBehindMouseClickGoogleDocs(mouseClickX, mouseClickY);
  }
  document.addEventListener("click", printMousePos);


  /**
   * Goes through the rectangles from svg
   * TODO: can optimize by instead of iterating through all the text,
   * we can start at a particular location (either from the bottom or top)
   * @returns string text
   */
  const getTextFromGoogleDocs = () => {
    // If Google Docs text behind exists, return that
    if (googleDocsTextBehind && googleDocsTextBehind.length > 0) {
      return googleDocsTextBehind;
    }

    // Otherwise, get text from the BOTTOM of the current page

    const page = getCurrentlyVisiblePageGoogleDocs(getPagesGoogleDocs());
    const rects = $("svg > g[role=paragraph] > rect", page).get();
    const selectionRects = $(".kix-canvas-tile-selection > svg > rect", page)
      .get()
      .map((el) => el.getBoundingClientRect());

    // TODO: starts at the end of the page and iterates backwards from there
    // TODO: add cursor tracking / use mouse position cleverely
    // to determine what rects / selections to look at

    // Iterate backwards from rect and append to text
    let text = "";
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      text = text + rect.ariaLabel;
    }

    return text;
  };

  // ************ NOTION ***********

  const getNotionBlocks = () => {
    const block = document.getElementsByClassName("notion-page-content")[0];
    // get all children
    const children = block.children;
    return children;
  };

  const getCurrentBlock = () => {
    // get all blocks
    const blocks = getNotionBlocks();

    // compare the global mouseY with all the blocks' getBoundingClientRect().top
    // return the block that is closest to the mouseY
    let closestBlock = null;
    let closestBlockDistance = null;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const blockTop = block.getBoundingClientRect().top;
      const blockDistance = Math.abs(blockTop - mouseY);
      if (closestBlockDistance == null || blockDistance < closestBlockDistance) {
        closestBlock = block;
        closestBlockDistance = blockDistance;
      }
    }
  };

  (function () {
    if (window.location.href.includes("notion.so")) {
      isNotion = true;
    }
  })();

}
