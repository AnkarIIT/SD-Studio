import { Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const ReviewCard = ({ name, city, text, color }: { name: string, city: string, text: string, color: string }) => (
  <div className="flex-shrink-0 w-[220px] bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.02)] mx-2 group hover:shadow-lg transition-all duration-500">
    <div className="flex gap-1 mb-3 text-violet-500">
      {[...Array(5)].map((_, i) => <Star key={i} size={8} fill="currentColor" />)}
    </div>
    <p className="text-gray-500 text-[10px] mb-4 leading-relaxed font-medium line-clamp-2 italic">"{text}"</p>
    <div className="flex items-center gap-2.5 pt-3 border-t border-gray-50">
      <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center text-white font-black text-[8px] shadow-sm`}>
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <h4 className="font-black text-gray-900 tracking-tight text-[9px] uppercase leading-none mb-1">{name}</h4>
        <p className="text-[7px] text-gray-300 uppercase tracking-widest font-bold leading-none">{city}</p>
      </div>
    </div>
  </div>
);

const Reviews = () => {
  const allReviews = [
    { name: "Arjun Mehta", city: "Bangalore", text: "The detail on the custom dragon model is simply breathtaking. Best 3D print in India!", color: "bg-violet-500" },
    { name: "Priya Sharma", city: "Mumbai", text: "Finally found a studio that understands premium finishes. My office desk looks magical now.", color: "bg-pink-500" },
    { name: "Vikram Singh", city: "Delhi", text: "Fast delivery and the NFC keychain works like a charm. Highly recommend SD Studios!", color: "bg-blue-500" },
    { name: "Ananya Iyer", city: "Chennai", text: "Built a custom gift for my brother. The team was so patient with my design requests.", color: "bg-teal-500" },
    { name: "Rohan Gupta", city: "Hyderabad", text: "The quality is industrial grade but the vibe is pure magic. 10/10 service.", color: "bg-orange-500" },
    { name: "Sanya Malhotra", city: "Pune", text: "Loved the anime decor! It feels solid and the colors are vibrant. A must-buy.", color: "bg-indigo-500" },
    { name: "Kabir Khan", city: "Lucknow", text: "Professional, creative, and very affordable for this level of quality. Amazing work.", color: "bg-rose-500" },
    
    { name: "Ishita Das", city: "Kolkata", text: "The unboxing experience alone is worth it. Feels like opening a high-end tech gadget.", color: "bg-blue-600" },
    { name: "Aditya Verma", city: "Ahmedabad", text: "Great communication throughout the process. My custom model turned out perfect.", color: "bg-violet-600" },
    { name: "Meera Nair", city: "Kochi", text: "The most unique gifts you can find. Everyone asks me where I got my desk stands.", color: "bg-pink-600" },
    { name: "Siddharth Rao", city: "Goa", text: "Incredible attention to detail. You can tell these guys love what they do.", color: "bg-cyan-500" },
    { name: "Zara Sheikh", city: "Jaipur", text: "Brought my sketch to life! The 3D printing quality is smooth as butter.", color: "bg-amber-500" },
    { name: "Rahul Bose", city: "Chandigarh", text: "Prompt service and the best packaging I've seen in a long time. 5 stars!", color: "bg-emerald-500" },
    { name: "Tanvi Hegde", city: "Surat", text: "The NFC integration is a game changer for my business cards. Brilliant idea.", color: "bg-fuchsia-500" },

    { name: "Karan Johar", city: "Indore", text: "Beautifully crafted and very durable. It survives my messy desk daily!", color: "bg-sky-500" },
    { name: "Nandini Reddy", city: "Vizag", text: "The perfect blend of art and technology. My custom vase is a conversation starter.", color: "bg-violet-400" },
    { name: "Sahil Pandey", city: "Patna", text: "Excellent customer support. They helped me choose the right material for my project.", color: "bg-pink-400" },
    { name: "Diya Kapur", city: "Gurgaon", text: "Modern, sleek, and playful. SD Studios is the future of 3D manufacturing.", color: "bg-blue-400" },
    { name: "Varun Dhawan", city: "Bhopal", text: "Fast turnaround time. I got my complex prototype in just 3 days!", color: "bg-teal-400" },
    { name: "Riya Sen", city: "Guwahati", text: "So happy with my order. The finish is so premium it doesn't look like a print.", color: "bg-rose-400" },
    { name: "Aman Deep", city: "Amritsar", text: "Quality, speed, and great vibes. Can't wait to order my next model!", color: "bg-indigo-400" },
  ];

  const row1 = allReviews.slice(0, 11);
  const row2 = allReviews.slice(11, 21);

  return (
    <section id="reviews" className="py-40 relative overflow-hidden bg-white">
      {/* Background Playful Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[120px] opacity-40 animate-pulse" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-16 mb-16 relative z-10 text-center">
        <div className="flex flex-col items-center gap-4 mb-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-100 rounded-full">
              <Sparkles size={14} className="text-violet-500" />
              <span className="text-violet-600 font-black text-[10px] uppercase tracking-widest text-center">Social Proof</span>
           </div>
        </div>
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85]">
          Trusted by <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-pink-500 italic">the Community.</span>
        </h2>
      </div>

      <div className="space-y-4 relative z-10">
        {/* Row 1: Left to Right */}
        <div className="flex overflow-hidden">
          <motion.div 
            animate={{ x: [0, -2464] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex"
          >
            {[...row1, ...row1].map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))}
          </motion.div>
        </div>

        {/* Row 2: Right to Left */}
        <div className="flex overflow-hidden">
          <motion.div 
            animate={{ x: [-2240, 0] }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="flex"
          >
            {[...row2, ...row2].map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
