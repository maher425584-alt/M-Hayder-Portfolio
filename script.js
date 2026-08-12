// ================================
// MOBILE MENU
// ================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        if (navLinks) {
            navLinks.classList.remove("active");
        }
    });
});


// ================================
// DARK / LIGHT MODE
// ================================

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            themeToggle.textContent = "🌙";
            localStorage.setItem("theme", "dark");
        } else {
            themeToggle.textContent = "☀️";
            localStorage.setItem("theme", "light");
        }

    });

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "🌙";
    }
}


// ================================
// CURRENT YEAR
// ================================

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ================================
// SCROLL ANIMATION
// ================================

const animatedElements = document.querySelectorAll(
    ".skill-card, .highlight, .timeline-content, .contact-card"
);

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                    observer.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.15
        }
    );

    animatedElements.forEach(element => {

        element.style.opacity = "0";
        element.style.transform = "translateY(25px)";
        element.style.transition =
            "opacity 0.6s ease, transform 0.6s ease";

        observer.observe(element);

    });
}


// ==================================================
// NOTIFICATION DASHBOARD
// ==================================================

const SUPABASE_URL =
    "https://wfwxidbdyqwkqsbaxtlj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3OKrT7wF_P5P6vitgWpFJw_Opq-NvTr";


const notificationList =
    document.getElementById("notificationList");

const notificationStatus =
    document.getElementById("notificationStatus");

const refreshNotifications =
    document.getElementById("refreshNotifications");


// ==================================================
// LOAD NOTIFICATIONS
// ==================================================

async function loadNotifications() {

    if (!notificationList) {
        return;
    }

    notificationList.innerHTML = `
        <div class="notification-empty">
            <span>🔄</span>
            <p>Loading notifications...</p>
        </div>
    `;

    if (notificationStatus) {
        notificationStatus.textContent = "Connecting...";
    }


    try {

        const url =
            `${SUPABASE_URL}/rest/v1/notifications` +
            `?select=id,device_id,app_name,title,message,created_at` +
            `&order=created_at.desc` +
            `&limit=100`;


        const response = await fetch(url, {

            method: "GET",

            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json"
            }

        });


        const responseText = await response.text();


        if (!response.ok) {

            console.error(
                "Supabase response:",
                response.status,
                responseText
            );

            throw new Error(
                `Supabase returned ${response.status}`
            );
        }


        let notifications;

        try {

            notifications = JSON.parse(responseText);

        } catch (error) {

            console.error(
                "Invalid JSON:",
                responseText
            );

            throw new Error(
                "Supabase returned invalid data"
            );
        }


        console.log(
            "Notifications received:",
            notifications
        );


        displayNotifications(notifications);


        if (notificationStatus) {
            notificationStatus.textContent =
                `● Connected • ${notifications.length} notifications`;
        }


    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );


        notificationList.innerHTML = `
            <div class="notification-empty">
                <span>⚠️</span>
                <p>
                    Unable to load notifications
                </p>
                <small>
                    ${escapeHTML(error.message)}
                </small>
            </div>
        `;


        if (notificationStatus) {
            notificationStatus.textContent =
                "● Connection Error";
        }

    }

}


// ==================================================
// DISPLAY NOTIFICATIONS
// ==================================================

function displayNotifications(notifications) {

    if (!notificationList) {
        return;
    }


    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {

        notificationList.innerHTML = `
            <div class="notification-empty">
                <span>🔔</span>
                <p>No notifications yet</p>
                <small>
                    Notifications from the Android app
                    will appear here.
                </small>
            </div>
        `;

        return;
    }


    notificationList.innerHTML = "";


    notifications.forEach(notification => {


        const card =
            document.createElement("div");


        card.className =
            "notification-card";


        const appName =
            notification.app_name ||
            "Unknown App";


        const title =
            notification.title ||
            "Notification";


        const message =
            notification.message ||
            "";


        const deviceId =
            notification.device_id ||
            "Unknown Device";


        let formattedTime =
            "Unknown time";


        if (notification.created_at) {

            const date =
                new Date(notification.created_at);


            if (!isNaN(date.getTime())) {

                formattedTime =
                    date.toLocaleString();

            }

        }


        card.innerHTML = `

            <div class="notification-card-top">

                <div class="notification-app">

                    📱
                    ${escapeHTML(appName)}

                </div>

                <div class="notification-time">

                    ${escapeHTML(formattedTime)}

                </div>

            </div>


            <div class="notification-title">

                ${escapeHTML(title)}

            </div>


            <div class="notification-message">

                ${escapeHTML(message)}

            </div>


            <div class="notification-device">

                Device:
                ${escapeHTML(deviceId)}

            </div>

        `;


        notificationList.appendChild(card);

    });

}


// ==================================================
// HTML SECURITY
// ==================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


// ==================================================
// REFRESH BUTTON
// ==================================================

if (refreshNotifications) {

    refreshNotifications.addEventListener(
        "click",
        () => {

            loadNotifications();

        }
    );

}


// ==================================================
// AUTOMATIC REFRESH
// ==================================================

setInterval(() => {

    loadNotifications();

}, 10000);


// ==================================================
// START
// ==================================================

loadNotifications();