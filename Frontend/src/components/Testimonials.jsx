import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, hoverElevate } from '../utils/animations';

const testimonials = [
  {
    quote: '\u201CEduSphere completely modernized our term registration and grading pipeline. The registrar team saved over 140 hours in the first month alone, and parent inquiries dropped dramatically.\u201D',
    initials: 'AS', name: 'Dr. Ananya Sharma', role: 'Academic Coordinator, Northbridge University',
    avatarBg: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  {
    quote: '\u201CThe granular role-based security, automated audit trails, and instant FERPA compliance satisfied every regulatory standard our governing board required. The roll out was seamless.\u201D',
    initials: 'MV', name: 'Marcus Vance, Ed.D.', role: 'Dean of Academic Affairs, Horizon Institute',
    avatarBg: 'bg-primary text-on-primary',
  },
  {
    quote: '\u201CHaving our live schedule, assignment grades, and campus notices directly in our phones changed student life completely. Everything is accessible in two taps.\u201D',
    initials: 'ER', name: 'Elena Rostova', role: 'Student Gov President, Nova College',
    avatarBg: 'bg-secondary text-on-secondary',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-margin lg:px-margin-lg">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">Institutional Impact</span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-2">Loved by educators, administrators, and students</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">See how leading institutions transformed their operational agility with EduSphere.</p>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-gutter-lg"
        >
          {testimonials.map((t) => (
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              custom={hoverElevate}
              key={t.name} 
              className="p-8 rounded-2xl bg-surface-container-lowest shadow-md flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]">star</span>
                  ))}
                </div>
                <p className="font-body-md text-body-md text-primary italic">{t.quote}</p>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <div className={`w-10 h-10 rounded-full ${t.avatarBg} font-bold flex items-center justify-center text-xs`}>{t.initials}</div>
                <div>
                  <p className="font-headline-sm text-label-md text-primary font-bold">{t.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
