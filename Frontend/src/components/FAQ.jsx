import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../utils/animations';

const faqItems = [
  { q: 'What is EduSphere?', a: 'EduSphere is a next-generation cloud-native Student Information System (SIS) and Academic Governance platform designed for modern higher education institutions, universities, and polytechnics. It unifies attendance, admissions, assignments, grading, transcripts, parent notifications, and fiscal tracking under one cohesive cockpit.' },
  { q: 'Who can use the platform?', a: 'EduSphere serves your entire campus ecosystem: students, faculty members, teaching assistants, academic advisors, department deans, campus registrars, bursars, and executive board members — each with custom-tailored role-based views.' },
  { q: 'Can students access their own academic records and transcripts on mobile?', a: 'Yes. EduSphere offers a fully responsive Progressive Web App and mobile portal where students can instantly inspect real-time grades, cumulative GPAs, timetable schedules, download verified cryptographic transcripts, and submit homework.' },
  { q: 'How does automated attendance tracking work?', a: 'EduSphere supports multi-modal attendance: dynamic anti-spoofing time-expiring QR codes generated on lecture screens, geofenced mobile verification, automated turnstile RFID card sync, or rapid one-tap manual rosters for faculty.' },
  { q: 'Can administrators manage multiple campuses or departments under one license?', a: "Absolutely. EduSphere's multi-tenant architecture enables regional university systems to manage autonomous faculties, satellite branches, and distinct grading rules within a centralized multi-campus hierarchy." },
  { q: 'Does EduSphere integrate with our existing SIS, ERP, or LMS systems?', a: 'Yes. We offer turnkey, bi-directional REST APIs and webhooks that easily connect with Canvas, Moodle, Blackboard, Ellucian Banner, SAP, Workday, and Google Classroom.' },
  { q: 'How quickly can a university onboard students and faculty?', a: 'With our automated bulk import assistant and LDAP/Active Directory connectors, medium-sized institutions can complete full roster synchronization and role configuration in less than 72 hours.' },
  { q: 'Is student data FERPA and GDPR compliant?', a: 'Yes. EduSphere is fully certified under FERPA and GDPR protocols. We enforce strict role-based access control (RBAC), end-to-end 256-bit encryption in transit and at rest, and audit logs for all student record accesses.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-margin lg:px-margin-lg" id="faq">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Frequently Asked Questions</span>
          <h2 className="font-display text-headline-lg text-slate-900 dark:text-white mt-2 font-bold tracking-tight transition-colors">Everything you need to know about EduSphere</h2>
          <p className="font-body-md text-body-md text-slate-500 dark:text-slate-400 mt-2 leading-relaxed transition-colors">Got additional questions? Our academic engineering specialists are always on standby.</p>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-col gap-3"
        >
          {faqItems.map((item, i) => (
            <motion.div 
              variants={fadeInUp}
              key={i} 
              className={`border rounded-xl transition-all overflow-hidden ${openIndex === i ? 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-slate-700 shadow-md dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-slate-50 hover:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800 border-transparent dark:border-slate-700/50 shadow-sm'}`}
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left font-display text-label-md text-slate-900 dark:text-white font-bold transition-colors"
                type="button"
                onClick={() => toggle(i)}
              >
                <span>{item.q}</span>
                <span
                  className="material-symbols-outlined transition-transform duration-300 text-secondary"
                  style={{ transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-6 pb-4 font-body-sm text-body-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors"
                  >
                    {item.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
