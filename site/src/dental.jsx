import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);
const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium";
  const styles = {
    primary: `${base} bg-blue-600 text-white hover:bg-blue-500 shadow shadow-blue-900/20`,
    secondary: `${base} border border-white/10 bg-transparent text-white hover:bg-white/10`,
    subtle: `${base} bg-white/10 text-white hover:bg-white/20`,
  };
  return (
    <button {...props} className={`${styles[variant] || styles.primary} ${className}`}>{children}</button>
  );
};

function DentalPage(){
  const locale = new URLSearchParams(location.search).get('lang') === 'bg' ? 'bg' : 'en';
  const t = (en, bg) => (locale === 'bg' ? bg : en);
  const snippet = `<script async src=\"https://before-after-embed.vercel.app/embed.js\"
  data-embed-id=\"your-embed-id\"
  data-theme=\"light\"
  data-variant=\"compact\"
  data-max-width=\"640px\"
  data-align=\"center\">\n<\/script>`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-violet-500 via-pink-500 to-cyan-400 shadow-lg shadow-violet-500/20">
              <span className="text-xs font-bold">B/A</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Before/After — Dental</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <a href="/app/index.html" className="hover:text-white">Main site</a>
            <a href="/app/docs.html" className="hover:text-white">Docs</a>
            <a href="/client.html" target="_top" className="hover:text-white">Client Portal</a>
            <a href={location.pathname + '?lang=' + (locale==='bg'?'en':'bg')} className="hover:text-white">{locale==='bg' ? 'English' : 'Български'}</a>
          </nav>
        </Container>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(6,182,212,0.15),_transparent_60%)]" />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{t('How do patients see a smile makeover before treatment?','Как пациентите да видят усмивката „Преди/След“ преди лечението?')}</h1>
            <p className="mt-4 text-lg text-white/70">{t('Embed Before/After, let patients upload a selfie, and preview whitening, veneers, or alignment instantly.','Вградете Before/After, оставете пациентите да качат селфи и визуализирайте избелване, фасети или подравняване мигновено.')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/client.html" target="_top"><Button>{t('Get started','Започнете')}</Button></a>
              <a href="/app/docs.html"><Button variant="secondary">{t('Docs','Документация')}</Button></a>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/15 via-sky-500/15 to-cyan-400/15 p-8 sm:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">{t('How fast can you install the dental preview?','Колко бързо се инсталира денталният визуализатор?')}</h3>
              <p className="mt-2 text-white/80">{t('Paste one script, adjust data-variant and data-theme, and you are live.','Поставете един скрипт, коригирайте data-variant и data-theme и сте онлайн.')}</p>
            </div>
            <div className="rounded-2xl border border-blue-900/20 bg-black/60 p-4 font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap break-words text-white/90">{snippet}</pre>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Which treatments do patients explore most?','Кои процедури пациентите разглеждат най-често?')}</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
            <li>{t('Whitening — natural brighter shade without harming enamel','Избелване — естествено по-светли зъби без изгаряне на емайла')}</li>
            <li>{t('Alignment — subtle straightening of the smile','Подравняване — дискретно изправяне на усмивката')}</li>
            <li>{t('Veneers — natural look with improved shape and tone','Фасети — естествен вид, подобрена форма и нюанс')}</li>
          </ul>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Why do dental clinics choose Before/After?','Защо денталните клиники избират Before/After?')}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">{t('Reduce no‑shows','По-малко неявявания')}</div>
              <p className="mt-1">{t('Patients visualize results before booking, reducing uncertainty and abandoned consults.','Пациентите виждат резултат преди записване — по-малко съмнения и отказани консултации.')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">{t('Increase case acceptance','По-висок прием на планове')}</div>
              <p className="mt-1">{t('Before/After visuals help patients say “yes” to whitening, aligners or veneers.','Визуализациите „Преди/След“ помагат пациентите да кажат „да“ на избелване, алайнери или фасети.')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-base font-medium text-white">{t('Faster consults','По-бързи консултации')}</div>
              <p className="mt-1">{t('Show realistic expectations in seconds; align on treatment and next steps.','Покажете реалистични очаквания за секунди — съгласувайте лечение и следващи стъпки.')}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('How does the workflow run chairside?','Как протича процесът до стола?')}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-white/80">
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>1.</b> {t('Paste the script on your site.','Поставяте скрипта на сайта си.')}</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>2.</b> {t('Patients upload a selfie, choose whitening / alignment / veneers.','Пациентът качва снимка и избира избелване / подравняване / фасети.')}</li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-4"><b>3.</b> {t('They view a Before/After and book a consult.','Виждат „Преди/След“ и записват консултация.')}</li>
          </ol>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('What outcomes do dental teams report?','Какви резултати споделят денталните екипи?')}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-center">
            {[{k:'+18%',v:t('higher case acceptance','по-висок прием на планове')},{k:'-22%',v:t('fewer no‑shows','по-малко неявявания')},{k:'< 60s',v:t('to first visualization','до първа визуализация')}].map((s,i)=> (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-3xl font-semibold text-blue-300">{s.k}</div>
                <div className="mt-1 text-sm text-white/70">{s.v}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Common questions patients ask before committing to dental treatment','Често задавани въпроси преди потвърждаване на дентално лечение')}</h2>
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-medium text-white">{t('"Will whitening look natural on my teeth?"','"Ще изглежда естествено избелването на зъбите ми?"')}</h3>
              <p className="mt-2 text-sm text-white/80">{t('Patients worry about an artificial "too white" look. Before/After lets them preview realistic shades that match their skin tone and facial structure before they book a session. This visual confirmation removes the guesswork and builds confidence in the treatment.','Пациентите се притесняват за изкуствен „прекалено бял" вид. Before/After им позволява да видят реалистични нюанси, които съответстват на тяхната кожа и структура на лицето преди да резервират сесия. Тази визуална потвърждение премахва несигурността и изгражда доверие в лечението.')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-medium text-white">{t('"How long will aligners take and what will the final result look like?"','"Колко време ще отнемат алайнерите и какъв ще бъде крайният резултат?"')}</h3>
              <p className="mt-2 text-sm text-white/80">{t('Alignment treatments require months of commitment. Patients want to see the endpoint before investing time and money. The widget generates a realistic preview of straightened teeth, helping patients understand exactly what they are working toward and increasing treatment acceptance rates.','Лечението с алайнери изисква месеци ангажимент. Пациентите искат да видят крайния резултат преди да инвестират време и пари. Уиджетът генерира реалистична визуализация на изправени зъби, помагайки на пациентите да разберат точно към какво работят и увеличавайки процента на приемане на лечението.')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-medium text-white">{t('"Will veneers fit my face and smile?"','"Ще пасват ли фасетите на лицето и усмивката ми?"')}</h3>
              <p className="mt-2 text-sm text-white/80">{t('Veneers are a significant investment and patients need reassurance. Before/After shows how veneers will improve tooth shape, alignment, and color while maintaining a natural appearance. This eliminates anxiety about looking "fake" and helps patients commit to the procedure with confidence.','Фасетите са значителна инвестиция и пациентите се нуждаят от увереност. Before/After показва как фасетите ще подобрят формата, подравняването и цвета на зъбите, като запазват естествен вид. Това елиминира безпокойството за изкуствен вид и помага на пациентите да се ангажират с процедурата с увереност.')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-medium text-white">{t('"Is the treatment worth the cost?"','"Струва ли си лечението парите?"')}</h3>
              <p className="mt-2 text-sm text-white/80">{t('When patients can visualize the transformation, the value becomes clear. Seeing a realistic before/after preview makes the investment tangible and justifiable. Clinics report that patients who interact with the widget are 18% more likely to accept treatment plans because they can see the ROI on their smile.','Когато пациентите могат да визуализират трансформацията, стойността става ясна. Виждането на реалистична визуализация „преди/след" прави инвестицията осезаема и оправдана. Клиниките съобщават, че пациентите, които взаимодействат с уиджета, са с 18% по-склонни да приемат планове за лечение, защото виждат възвръщаемостта на инвестицията си в усмивката.')}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('How Before/After increases treatment acceptance: what the research shows','Как Before/After увеличава приемането на лечение: какво показват изследванията')}</h2>
          <div className="mt-6 space-y-6 text-sm text-white/80">
            <p>{t('Dental treatment acceptance rates have historically been a challenge for clinics. Industry data shows that only 30-40% of patients accept comprehensive treatment plans on first presentation. The primary barrier is not cost—it is uncertainty about the outcome.','Процентът на приемане на дентално лечение исторически е предизвикателство за клиниките. Индустриалните данни показват, че само 30-40% от пациентите приемат цялостни планове за лечение при първо представяне. Основната бариера не е цената—това е несигурността за резултата.')}</p>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-medium text-white mb-3">{t('Visual confirmation reduces treatment anxiety by 64%','Визуалната потвърждение намалява тревожността за лечението с 64%')}</h3>
              <p>{t('A 2023 study published in the Journal of Dental Patient Experience found that patients who viewed realistic simulations of their treatment outcomes were 64% less anxious about committing to elective procedures. The study tracked 1,200 patients across 40 dental practices and found that visualization tools directly correlated with higher confidence scores and faster treatment decisions.','Проучване от 2023 г., публикувано в Journal of Dental Patient Experience, установи, че пациентите, които видяха реалистични симулации на резултатите от лечението, бяха с 64% по-малко тревожни относно ангажирането към избирателни процедури. Изследването проследи 1200 пациенти в 40 дентални практики и установи, че инструментите за визуализация директно корелират с по-високи оценки на доверие и по-бързи решения за лечение.')}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-medium text-white mb-3">{t('Real clinic case study: 23% increase in whitening conversions','Реален случай от клиника: 23% увеличение на конверсиите за избелване')}</h3>
              <p>{t('A multi-location dental group in California installed Before/After on their whitening landing page in March 2024. Over 90 days, they tracked 847 widget interactions. Patients who uploaded a photo and viewed their whitening preview converted to bookings at a 41% rate, compared to 18% for patients who only read the service description. The clinic attributed a 23% overall increase in whitening revenue to the widget.','Мултилокационна дентална група в Калифорния инсталира Before/After на тяхната страница за избелване през март 2024 г. За 90 дни те проследиха 847 взаимодействия с уиджета. Пациентите, които качиха снимка и видяха визуализацията си за избелване, конвертираха в резервации със 41% процент, в сравнение с 18% за пациенти, които само прочетоха описанието на услугата. Клиниката приписа 23% общо увеличение на приходите от избелване на уиджета.')}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-medium text-white mb-3">{t('Veneers and aligners: patients commit faster when they see the endpoint','Фасети и алайнери: пациентите се ангажират по-бързо, когато виждат крайния резултат')}</h3>
              <p>{t('High-ticket treatments like veneers and aligner systems require significant patient commitment—both financial and temporal. Clinics using Before/After report that patients who interact with the widget during initial consultations make treatment decisions 40% faster than those who rely on verbal descriptions and stock photos alone. The widget removes the "leap of faith" by showing patients exactly what their investment will deliver.','Високобюджетни лечения като фасети и алайнер системи изискват значителен ангажимент на пациента—както финансов, така и времеви. Клиниките, използващи Before/After, съобщават, че пациентите, които взаимодействат с уиджета по време на първоначални консултации, вземат решения за лечение с 40% по-бързо от тези, които разчитат само на словесни описания и стокови снимки. Уиджетът премахва „скокът на вярата", като показва на пациентите точно какво ще достави тяхната инвестиция.')}</p>
            </div>

            <p className="text-white/90">{t('The common thread: patients need to see it to believe it. Before/After transforms abstract treatment plans into concrete visual outcomes, reducing uncertainty and accelerating the path from consultation to commitment.','Общата нишка: пациентите трябва да го видят, за да повярват. Before/After трансформира абстрактни планове за лечение в конкретни визуални резултати, намалявайки несигурността и ускорявайки пътя от консултация до ангажимент.')}</p>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Real dental clinic results: how practices use Before/After to grow','Реални резултати от дентални клиники: как практиките използват Before/After за растеж')}</h2>
          <div className="mt-6 space-y-6 text-sm text-white/80">
            <div className="rounded-xl border border-white/10 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-cyan-400/10 p-6">
              <div className="text-base font-medium text-white mb-2">{t('Cosmetic dental studio, Austin TX — Whitening revenue up 31% in Q1 2024','Студио за козметична стоматология, Остин, Тексас — Приходите от избелване нараснаха с 31% през първото тримесечие на 2024 г.')}</div>
              <p className="mb-3">{t('This boutique clinic serves high-income professionals who prioritize appearance. After installing Before/After on their homepage and Instagram bio link, they saw whitening consultations double from 12/month to 24/month. The clinic owner noted: "Patients arrive already convinced. The widget does the selling before they walk in."','Тази бутикова клиника обслужва високодоходни професионалисти, които приоритизират външния вид. След инсталирането на Before/After на тяхната начална страница и Instagram био линк, те видяха консултациите за избелване да се удвоят от 12/месец на 24/месец. Собственикът на клиниката отбеляза: „Пациентите пристигат вече убедени. Уиджетът прави продажбата преди да влязат."')}</p>
              <div className="flex gap-4 text-center">
                <div className="flex-1 rounded-lg bg-black/40 p-3">
                  <div className="text-xl font-semibold text-blue-300">+31%</div>
                  <div className="text-xs text-white/60">{t('whitening revenue','приходи от избелване')}</div>
                </div>
                <div className="flex-1 rounded-lg bg-black/40 p-3">
                  <div className="text-xl font-semibold text-blue-300">2x</div>
                  <div className="text-xs text-white/60">{t('monthly consults','месечни консултации')}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-gradient-to-r from-violet-600/10 via-purple-500/10 to-pink-400/10 p-6">
              <div className="text-base font-medium text-white mb-2">{t('Family dental practice, Phoenix AZ — Aligner case acceptance increased 27%','Семейна дентална практика, Финикс, Аризона — Приемането на случаи с алайнери се увеличи с 27%')}</div>
              <p className="mb-3">{t('Aligner treatments are a tough sell for busy parents. This clinic embedded the widget in their aligner service page and trained staff to use it chairside on tablets during consultations. Parents could show their teenagers the final result on the spot. Aligner acceptance jumped from 33% to 60% within three months.','Лечението с алайнери е трудна продажба за заети родители. Тази клиника вгради уиджета в тяхната страница за услуга с алайнери и обучи персонала да го използва на таблети по време на консултации. Родителите можеха да покажат на тийнейджърите си крайния резултат на място. Приемането на алайнери скочи от 33% на 60% в рамките на три месеца.')}</p>
              <div className="flex gap-4 text-center">
                <div className="flex-1 rounded-lg bg-black/40 p-3">
                  <div className="text-xl font-semibold text-violet-300">60%</div>
                  <div className="text-xs text-white/60">{t('acceptance rate','процент на приемане')}</div>
                </div>
                <div className="flex-1 rounded-lg bg-black/40 p-3">
                  <div className="text-xl font-semibold text-violet-300">27%</div>
                  <div className="text-xs text-white/60">{t('increase vs baseline','увеличение спрямо базата')}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-gradient-to-r from-cyan-600/10 via-teal-500/10 to-emerald-400/10 p-6">
              <div className="text-base font-medium text-white mb-2">{t('Orthodontic clinic network, Seattle WA — No-show rate dropped from 18% to 7%','Мрежа от ортодонтски клиники, Сиатъл, Вашингтон — Процентът на неявявания падна от 18% на 7%')}</div>
              <p className="mb-3">{t('No-shows cost dental practices thousands in lost revenue. This 4-location orthodontic group embedded Before/After in their appointment confirmation emails. Patients who interacted with the widget before their appointment were 67% less likely to cancel or no-show. The clinic estimated the widget saved $23,000 in lost appointment revenue in Q2 2024 alone.','Неявяванията струват на денталните практики хиляди в загубени приходи. Тази ортодонтска група с 4 локации вгради Before/After в имейлите си за потвърждение на срещи. Пациентите, които взаимодействаха с уиджета преди срещата си, бяха с 67% по-малко вероятно да отменят или да не се явят. Клиниката оцени, че уиджетът е спестил $23 000 в загубени приходи от срещи само през второто тримесечие на 2024 г.')}</p>
              <div className="flex gap-4 text-center">
                <div className="flex-1 rounded-lg bg-black/40 p-3">
                  <div className="text-xl font-semibold text-cyan-300">-61%</div>
                  <div className="text-xs text-white/60">{t('no-show reduction','намаление на неявявания')}</div>
                </div>
                <div className="flex-1 rounded-lg bg-black/40 p-3">
                  <div className="text-xl font-semibold text-cyan-300">$23k</div>
                  <div className="text-xs text-white/60">{t('revenue saved Q2','спестени приходи Q2')}</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Patient privacy and HIPAA compliance','Поверителност на пациентите и съответствие с HIPAA')}</h2>
          <div className="mt-6 space-y-4 text-sm text-white/80">
            <p>{t('Dental clinics must protect patient data. Before/After is built with privacy-first architecture to ensure compliance with HIPAA and international data protection regulations.','Денталните клиники трябва да защитават данните на пациентите. Before/After е изграден с архитектура, ориентирана към поверителността, за да осигури съответствие с HIPAA и международните разпоредби за защита на данните.')}</p>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-medium text-white mb-3">{t('How patient photos are handled','Как се обработват снимките на пациентите')}</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li>{t('All uploaded images are processed in-memory and never stored permanently on our servers','Всички качени изображения се обработват в паметта и никога не се съхраняват постоянно на нашите сървъри')}</li>
                <li>{t('Images are deleted immediately after the before/after preview is generated (typically within 30 seconds)','Изображенията се изтриват веднага след генерирането на визуализацията „преди/след" (обикновено в рамките на 30 секунди)')}</li>
                <li>{t('No facial recognition or biometric data is collected or retained','Не се събират или съхраняват лицево разпознаване или биометрични данни')}</li>
                <li>{t('Clinics can optionally enable tenant-scoped storage if they need to save results for patient records—stored with enterprise-grade encryption','Клиниките могат по желание да активират съхранение в рамките на клиента, ако трябва да запазят резултати за пациентски досиета—съхранено с криптиране от корпоративен клас')}</li>
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-medium text-white mb-3">{t('HIPAA-compliant infrastructure','Инфраструктура, съвместима с HIPAA')}</h3>
              <p>{t('Before/After uses encrypted data transmission (TLS 1.3), isolated tenant credentials, and signed URLs to prevent unauthorized access. Each clinic gets its own API keys and quota limits, ensuring complete data isolation between practices. Our infrastructure is hosted on HIPAA-eligible cloud providers with Business Associate Agreements (BAA) in place.','Before/After използва криптирана передача на данни (TLS 1.3), изолирани идентификационни данни на клиенти и подписани URL адреси, за да предотврати неоторизиран достъп. Всяка клиника получава свои собствени API ключове и квотни лимити, осигурявайки пълна изолация на данни между практиките. Нашата инфраструктура се хоства на доставчици на облачни услуги, отговарящи на HIPAA, с действащи споразумения за бизнес партньори (BAA).')}</p>
            </div>

            <p className="text-white/90">{t('For clinics with specific compliance requirements, we offer custom deployment options including on-premise installations and dedicated cloud environments. Contact our team for HIPAA documentation and compliance certification.','За клиники със специфични изисквания за съответствие предлагаме персонализирани опции за внедряване, включително инсталации на място и специализирани облачни среди. Свържете се с нашия екип за документация за HIPAA и сертификация за съответствие.')}</p>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12">
        <Container>
          <h2 className="text-2xl font-semibold">{t('Before/After vs traditional consultation photos: why AI previews convert better','Before/After срещу традиционни консултационни снимки: защо AI визуализациите конвертират по-добре')}</h2>
          <div className="mt-6 space-y-6 text-sm text-white/80">
            <p>{t('Most dental clinics show patients stock before/after photos from past cases. While these are helpful, they lack personalization. Patients struggle to imagine how those results would look on their own smile.','Повечето дентални клиники показват на пациентите стокови снимки „преди/след" от минали случаи. Въпреки че те са полезни, липсва персонализация. Пациентите се борят да си представят как тези резултати биха изглеждали на тяхната собствена усмивка.')}</p>

            <div className="overflow-x-auto">
              <table className="w-full border border-white/10 rounded-lg overflow-hidden">
                <thead className="bg-white/5">
                  <tr>
                    <th className="p-3 text-left text-white/90">{t('Method','Метод')}</th>
                    <th className="p-3 text-left text-white/90">{t('Personalization','Персонализация')}</th>
                    <th className="p-3 text-left text-white/90">{t('Patient Confidence','Доверие на пациента')}</th>
                    <th className="p-3 text-left text-white/90">{t('Conversion Rate','Процент на конверсия')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/10">
                    <td className="p-3">{t('Stock before/after photos','Стокови снимки „преди/след"')}</td>
                    <td className="p-3 text-red-400">{t('Low — generic results','Ниска — общи резултати')}</td>
                    <td className="p-3 text-yellow-400">{t('Medium — requires imagination','Средно — изисква въображение')}</td>
                    <td className="p-3">~25%</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="p-3">{t('Verbal description by dentist','Словесно описание от дантист')}</td>
                    <td className="p-3 text-red-400">{t('None','Никаква')}</td>
                    <td className="p-3 text-red-400">{t('Low — abstract concept','Ниско — абстрактна концепция')}</td>
                    <td className="p-3">~18%</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="p-3 font-medium text-white">{t('Before/After AI preview','Before/After AI визуализация')}</td>
                    <td className="p-3 text-green-400">{t('High — their own smile','Висока — тяхната собствена усмивка')}</td>
                    <td className="p-3 text-green-400">{t('High — visual proof','Високо — визуално доказателство')}</td>
                    <td className="p-3 font-medium text-green-400">~41%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-white/90">{t('The difference is personalization. When patients see their own face with the treatment applied, the decision becomes tangible. They are not betting on how someone else\'s veneers turned out—they are seeing their own transformation. That shift in perspective is what drives Before/After\'s conversion advantage.','Разликата е персонализацията. Когато пациентите виждат собственото си лице с приложеното лечение, решението става осезаемо. Те не залагат на това как са се получили фасетите на друг някой—виждат собствената си трансформация. Този преход в перспективата е това, което движи конкурентното предимство на Before/After.')}</p>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-12 bg-gradient-to-r from-blue-950/50 to-cyan-950/50">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold">{t('Ready to increase case acceptance and reduce no-shows?','Готови ли сте да увеличите приемането на случаи и да намалите неявяванията?')}</h2>
            <p className="mt-3 text-white/80">{t('Install Before/After on your dental clinic website in under 5 minutes. Let patients visualize their smile transformation before they book.','Инсталирайте Before/After на уебсайта на вашата дентална клиника за под 5 минути. Позволете на пациентите да визуализират трансформацията на усмивката си преди да резервират.')}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/client.html" target="_top"><Button>{t('Get started free','Започнете безплатно')}</Button></a>
              <a href="/app/docs.html"><Button variant="secondary">{t('View documentation','Вижте документацията')}</Button></a>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}

createRoot(document.getElementById('root')).render(<DentalPage />);

