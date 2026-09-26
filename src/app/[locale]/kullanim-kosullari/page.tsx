import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { LegalDocument } from "@/components/legal-document";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const english = locale === "en";

  return {
    title: english ? "Terms of Service" : "Kullanım Koşulları",
    description: english
      ? "The terms that apply when using the Radyo ÖzÜ website and live radio service."
      : "Radyo ÖzÜ web sitesini ve canlı radyo hizmetini kullanırken geçerli olan koşullar.",
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === "en") {
    return (
      <LegalDocument
        eyebrow="Legal"
        title="Terms of Service"
        intro="These short terms apply when you use the Radyo ÖzÜ website and listen to its stream."
        lastUpdatedLabel="Last updated"
        lastUpdated="September 26, 2026"
        sections={[
          {
            heading: "About Radyo ÖzÜ",
            paragraphs: [
              "Radyo ÖzÜ is a student broadcasting body under the Özyeğin University Dean of Students. It is not a separate legal entity.",
            ],
          },
          {
            heading: "Site content",
            paragraphs: [
              "Unless stated otherwise, the text, visual identity, programme information, and original material on this site belong to Özyeğin University, Radyo ÖzÜ, or the person who licensed the material to us. You may view and share links to the site for personal, non-commercial use. You may not present our content or marks as your own or reuse them commercially without permission.",
            ],
          },
          {
            heading: "Using the site",
            paragraphs: [
              "Use the site lawfully and without disrupting it for others. Do not try to bypass access controls, enter administrative areas without permission, damage the service, overload it with automated requests, or use it to infringe another person's rights.",
            ],
          },
          {
            heading: "Availability and warranty",
            paragraphs: [
              "We try to keep the schedule, stream, and other information accurate and available, but student programming and live services change. The site and stream are provided as available, without a promise that they will always be uninterrupted, error-free, or current. Nothing here limits rights that cannot legally be limited.",
            ],
          },
          {
            heading: "External services and links",
            paragraphs: [
              "The site uses or links to services such as Radio.co, Spotify, Google, and social media platforms. Their own terms and privacy rules apply when you use them. We do not control their availability or content and are not responsible for independent third-party services.",
            ],
          },
          {
            heading: "Applicable law",
            paragraphs: [
              "These terms are governed by the laws of the Republic of Türkiye. Any mandatory rights available to you under applicable law remain in place.",
            ],
          },
          {
            heading: "Contact",
            paragraphs: [
              "For a question about these terms or permission to reuse content, email radyoozu@ozu.edu.tr.",
            ],
          },
        ]}
      />
    );
  }

  return (
    <LegalDocument
      eyebrow="Yasal"
      title="Kullanım Koşulları"
      intro="Bu kısa koşullar, Radyo ÖzÜ web sitesini kullandığında ve yayını dinlediğinde geçerlidir."
      lastUpdatedLabel="Son güncelleme"
      lastUpdated="26 Eylül 2026"
      sections={[
        {
          heading: "Radyo ÖzÜ hakkında",
          paragraphs: [
            "Radyo ÖzÜ, Özyeğin Üniversitesi Öğrenci Dekanlığı bünyesinde çalışan bir öğrenci yayın organıdır. Ayrı bir tüzel kişiliği yoktur.",
          ],
        },
        {
          heading: "Site içeriği",
          paragraphs: [
            "Aksi belirtilmedikçe bu sitedeki metinler, görsel kimlik, program bilgileri ve özgün içerikler Özyeğin Üniversitesi'ne, Radyo ÖzÜ'ye veya içeriği kullanmamıza izin veren kişiye aittir. Siteyi kişisel ve ticari olmayan amaçlarla görüntüleyebilir, bağlantılarını paylaşabilirsin. İçeriğimizi veya markalarımızı kendine aitmiş gibi gösteremez; izinsiz ticari amaçla kullanamazsın.",
          ],
        },
        {
          heading: "Siteyi kullanırken",
          paragraphs: [
            "Siteyi yasalara uygun ve başkalarının kullanımını bozmadan kullan. Erişim kontrollerini aşmaya, izinsiz yönetim alanlarına girmeye, hizmete zarar vermeye, otomatik isteklerle sistemi aşırı yüklemeye veya başkasının haklarını ihlal etmeye çalışma.",
          ],
        },
        {
          heading: "Erişilebilirlik ve garanti",
          paragraphs: [
            "Yayın akışını, canlı yayını ve diğer bilgileri doğru ve erişilebilir tutmaya çalışıyoruz; yine de öğrenci programları ve canlı hizmetler değişebilir. Site ve yayın mevcut hâliyle sunulur; her zaman kesintisiz, hatasız veya güncel olacağını garanti etmeyiz. Buradaki hiçbir ifade, hukuken sınırlandırılamayacak haklarını ortadan kaldırmaz.",
          ],
        },
        {
          heading: "Dış hizmetler ve bağlantılar",
          paragraphs: [
            "Site Radio.co, Spotify, Google ve sosyal medya platformları gibi hizmetleri kullanır veya bunlara bağlantı verir. Bu hizmetleri kullandığında kendi koşulları ve gizlilik kuralları geçerlidir. Bağımsız üçüncü taraf hizmetlerinin erişilebilirliğini veya içeriğini kontrol etmeyiz ve bunlardan sorumlu değiliz.",
          ],
        },
        {
          heading: "Uygulanacak hukuk",
          paragraphs: [
            "Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Uygulanabilir mevzuatın sana tanıdığı zorunlu haklar saklıdır.",
          ],
        },
        {
          heading: "İletişim",
          paragraphs: [
            "Bu koşullarla ilgili bir soru veya içeriği yeniden kullanma izni için radyoozu@ozu.edu.tr adresine yazabilirsin.",
          ],
        },
      ]}
    />
  );
}
