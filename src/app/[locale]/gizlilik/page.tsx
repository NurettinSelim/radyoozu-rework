import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { LegalDocument } from "@/components/legal-document";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

const LAST_UPDATED = "September 26, 2026";
const LAST_UPDATED_TR = "26 Eylül 2026";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const english = locale === "en";

  return {
    title: english ? "Privacy Policy" : "Gizlilik Politikası",
    description: english
      ? "How Radyo ÖzÜ's website uses cookies, analytics, browser storage, and third-party services."
      : "Radyo ÖzÜ web sitesinin çerezleri, analitiği, tarayıcı depolamasını ve üçüncü taraf hizmetlerini nasıl kullandığı.",
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === "en") {
    return (
      <LegalDocument
        eyebrow="Legal"
        title="Privacy Policy"
        intro="This page explains what happens to information when you use the Radyo ÖzÜ website and our internal Google mailbox tools."
        lastUpdatedLabel="Last updated"
        lastUpdated={LAST_UPDATED}
        sections={[
          {
            heading: "Who we are",
            paragraphs: [
              "Radyo ÖzÜ is the student radio station of Özyeğin University. You can reach us at radyoozu@ozu.edu.tr.",
            ],
          },
          {
            heading: "What this website collects",
            paragraphs: [
              "The public website has no visitor accounts, newsletter signup, contact form, comments, payment flow, or store. If you use an email link, your message is sent by your own email service; it is not submitted through a website form.",
            ],
            items: [
              "Cookie choice: the site stores whether you accepted or rejected analytics in a cookie for one year.",
              "Analytics: Google Analytics 4 loads only after you accept. It records site usage and the site's custom events, such as starting the radio player and clicking contact or outbound links. If you reject analytics, the Google Analytics script is not loaded.",
              "Browser storage: the site keeps your programme reminder choices and reminder history in local storage. The game page keeps your best score and sound preference there too. This information stays in your browser and is not written to the site's content database.",
              "Notifications: if you turn on a programme reminder, your browser asks for notification permission. Reminders use a local service worker while the site is open; the site does not create a server-side push subscription.",
            ],
          },
          {
            heading: "Third-party services",
            items: [
              "Radio.co provides the live stream, station artwork, and now-playing information. The visible site checks Radio.co for track information, and your browser connects to Radio.co when you start the stream. Radio.co therefore receives the technical request information needed to answer those requests.",
              "Spotify's API is called on the server to show public playlists from Radyo ÖzÜ's own Spotify account. The page shows playlist cards and links, not an embedded Spotify player. Visitors do not sign in with Spotify and we do not receive their Spotify account data.",
              "Google Analytics is the only visitor analytics service in the code and is consent-gated. Google may set analytics cookies after consent.",
              "The site links to Instagram, X, YouTube, Spotify, Özyeğin University, and email. Those services receive information only when your browser requests their content or you follow a link. There are no embedded social feeds or advertising trackers in the site.",
              "The site is hosted on Vercel. Editable public content is stored as JSON in Vercel Blob. This content store does not contain visitor profiles or form submissions.",
            ],
          },
          {
            heading: "Google API use",
            paragraphs: [
              "Our Google Cloud app, “Radyo OzU”, uses the Gmail API with the gmail.modify scope only for our own mailbox, radyoozu@ozu.edu.tr. Authorised team members use internal tools to read, draft, and send the radio's email. The app does not access any visitor's or listener's Google account, does not collect other users' Google data, and never sells or shares Google user data.",
              "Radyo ÖzÜ's use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
            ],
          },
          {
            heading: "How long information is kept",
            paragraphs: [
              "The analytics choice cookie lasts for one year. Programme reminders, reminder history, the game score, and the sound preference remain in local storage until you change them, clear site data, or your browser removes them. Google Analytics retention follows the setting on our Google Analytics property; the repository does not set a separate retention period. Emails sent to us stay in the radio mailbox for as long as the team needs them for the conversation and its work. Public site content remains until an authorised editor changes it.",
            ],
          },
          {
            heading: "Security and access",
            paragraphs: [
              "Administrative pages and internal mailbox tools are limited to authorised team members. Admin access uses Google sign-in for the configured university account. Server credentials are not exposed to the browser, and the stored Spotify refresh token is encrypted. No internet service can promise perfect security, but access is kept to the people who need it.",
            ],
          },
          {
            heading: "Your choices and rights",
            paragraphs: [
              "You can reject analytics in the cookie banner, clear cookies and local storage in your browser, remove programme reminders, and withdraw notification permission in browser settings. Depending on the law that applies to you, you may also ask what personal information we hold about you and request correction or deletion. These requests do not affect information we must keep by law.",
            ],
          },
          {
            heading: "Contact",
            paragraphs: [
              "For a privacy question or request, email radyoozu@ozu.edu.tr. Please describe what you need so the team can find and handle the relevant information.",
            ],
          },
        ]}
      />
    );
  }

  return (
    <LegalDocument
      eyebrow="Yasal"
      title="Gizlilik Politikası"
      intro="Bu sayfa, Radyo ÖzÜ web sitesini ve Google posta kutumuza bağlı ekip içi araçları kullandığında bilgilerle ne olduğunu anlatır."
      lastUpdatedLabel="Son güncelleme"
      lastUpdated={LAST_UPDATED_TR}
      sections={[
        {
          heading: "Biz kimiz?",
          paragraphs: [
            "Radyo ÖzÜ, Özyeğin Üniversitesi öğrenci radyosudur. Bize radyoozu@ozu.edu.tr adresinden ulaşabilirsin.",
          ],
        },
        {
          heading: "Bu site ne topluyor?",
          paragraphs: [
            "Herkese açık sitede ziyaretçi hesabı, bülten kaydı, iletişim formu, yorum alanı, ödeme akışı veya mağaza yok. Bir e-posta bağlantısını kullanırsan mesajın kendi e-posta hizmetin üzerinden gider; site içindeki bir forma gönderilmez.",
          ],
          items: [
            "Çerez tercihi: Analitiği kabul veya reddettiğin bilgisi bir yıl süreli bir çerezde tutulur.",
            "Analitik: Google Analytics 4 yalnızca kabul edersen yüklenir. Sayfa kullanımı ile radyo oynatıcısını başlatma, iletişim veya dış bağlantılara tıklama gibi sitenin tanımladığı olayları kaydeder. Reddedersen Google Analytics betiği yüklenmez.",
            "Tarayıcı depolaması: Program hatırlatma tercihlerin ve gönderilen hatırlatmaların kaydı yerel depolamada tutulur. Oyun sayfası da en yüksek puanını ve ses tercihini burada saklar. Bunlar tarayıcında kalır; sitenin içerik veritabanına yazılmaz.",
            "Bildirimler: Bir program hatırlatmasını açarsan tarayıcın bildirim izni ister. Hatırlatmalar site açıkken yerel bir service worker ile çalışır; site sunucu tarafında bir anlık bildirim aboneliği oluşturmaz.",
          ],
        },
        {
          heading: "Üçüncü taraf hizmetleri",
          items: [
            "Canlı yayın, istasyon görselleri ve çalan parça bilgisi Radio.co üzerinden gelir. Açık olan site parça bilgisi için Radio.co'ya istek gönderir; oynat düğmesine bastığında tarayıcın canlı yayın için Radio.co'ya bağlanır. Bu nedenle Radio.co, bu isteklere cevap vermek için gereken teknik istek bilgilerini alır.",
            "Radyo ÖzÜ'nün kendi Spotify hesabındaki herkese açık çalma listelerini göstermek için Spotify API'sine sunucu tarafından bağlanılır. Sayfada gömülü Spotify oynatıcısı değil, çalma listesi kartları ve bağlantıları vardır. Ziyaretçiler Spotify ile giriş yapmaz; Spotify hesap bilgilerini almayız.",
            "Koddaki tek ziyaretçi analitik hizmeti Google Analytics'tir ve izne bağlıdır. Google, izin verdikten sonra analitik çerezleri koyabilir.",
            "Sitede Instagram, X, YouTube, Spotify, Özyeğin Üniversitesi ve e-posta bağlantıları bulunur. Bu hizmetler ancak tarayıcın içeriklerini istediğinde veya bağlantılarını açtığında bilgi alır. Sitede gömülü sosyal medya akışı ya da reklam takipçisi yoktur.",
            "Site Vercel üzerinde barındırılır. Düzenlenebilir herkese açık içerik Vercel Blob'da JSON olarak saklanır. Bu içerik deposunda ziyaretçi profili veya form gönderimi bulunmaz.",
          ],
        },
        {
          heading: "Google API kullanımı",
          paragraphs: [
            "“Radyo OzU” adlı Google Cloud uygulamamız, Gmail API'ye yalnızca bize ait radyoozu@ozu.edu.tr posta kutusu için gmail.modify kapsamıyla erişir. Yetkili ekip üyeleri, ekip içi araçlarla radyonun e-postalarını okuyabilir, taslak hazırlayabilir ve gönderebilir. Uygulama hiçbir ziyaretçinin veya dinleyicinin Google hesabına erişmez, başka kullanıcıların Google verilerini toplamaz ve Google kullanıcı verilerini hiçbir zaman satmaz ya da paylaşmaz.",
            "Radyo ÖzÜ'nün Google API'lerinden aldığı bilgileri kullanımı, Sınırlı Kullanım şartları dâhil olmak üzere Google API Hizmetleri Kullanıcı Verileri Politikası'na uyar.",
          ],
        },
        {
          heading: "Bilgileri ne kadar tutuyoruz?",
          paragraphs: [
            "Analitik tercihi çerezi bir yıl kalır. Program hatırlatmaları, hatırlatma geçmişi, oyun puanı ve ses tercihi; sen değiştirene, site verilerini temizleyene veya tarayıcın kaldırana kadar yerel depolamada kalır. Google Analytics saklama süresi Google Analytics mülkümüzdeki ayara bağlıdır; kod deposunda ayrı bir süre tanımlanmamıştır. Bize gönderilen e-postalar, görüşme ve ekip işi için gerektiği sürece radyo posta kutusunda kalır. Herkese açık site içeriği, yetkili bir editör değiştirene kadar saklanır.",
          ],
        },
        {
          heading: "Güvenlik ve erişim",
          paragraphs: [
            "Yönetim sayfalarına ve ekip içi posta araçlarına yalnızca yetkili ekip üyeleri erişebilir. Yönetici girişi, tanımlı üniversite hesabıyla Google üzerinden yapılır. Sunucu bilgileri tarayıcıya açılmaz; saklanan Spotify yenileme belirteci şifrelidir. Hiçbir internet hizmeti kusursuz güvenlik sözü veremez, ama erişimi yalnızca ihtiyacı olan kişilerle sınırlarız.",
          ],
        },
        {
          heading: "Tercihlerin ve hakların",
          paragraphs: [
            "Çerez bildiriminden analitiği reddedebilir; tarayıcından çerezleri ve yerel depolamayı temizleyebilir; program hatırlatmalarını kaldırabilir ve bildirim iznini geri alabilirsin. Sana uygulanan mevzuata göre elimizdeki kişisel bilgileri öğrenme, düzeltme veya silme talebinde de bulunabilirsin. Yasal olarak saklamamız gereken bilgiler bu taleplerin dışında kalabilir.",
          ],
        },
        {
          heading: "İletişim",
          paragraphs: [
            "Gizlilikle ilgili bir soru veya talep için radyoozu@ozu.edu.tr adresine yaz. İlgili bilgiyi bulup işleyebilmemiz için neye ihtiyacın olduğunu açıkça belirtmen yeterli.",
          ],
        },
      ]}
    />
  );
}
