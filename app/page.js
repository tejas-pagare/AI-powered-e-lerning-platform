// import { Button } from "@/components/ui/button";
// import { UserButton } from "@clerk/nextjs";
// import Image from "next/image";

// export default function Home() {
//   return (
//    <div>
//     <Button>Click Me</Button>
//     <UserButton/>
//    </div>
//   );
// }

'use client'

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-center items-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl font-extrabold mb-4 text-center"
      >
        AI-Powered Course Generation Platform
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="text-xl text-center max-w-2xl mb-6"
      >
        Instantly generate personalized AI courses tailored to your learning goals. Explore interactive content, quizzes, and real-world projects powered by cutting-edge artificial intelligence.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.6 }}
        className="mb-8"
      >
        <a href="/workspace">
          <Button className="text-lg px-6 py-3 rounded-2xl shadow-lg bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center gap-2">
            <Sparkles size={20} />
            Create Your AI Course And Go to workspace
          </Button>
        </a>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <img src="https://images.unsplash.com/photo-1677691820099-a6e8040aa077?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="AI Education" className="rounded-xl shadow-md w-full h-64 object-cover" />
        <img src="https://plus.unsplash.com/premium_photo-1663013231623-d266b26fcd9e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Online Learning" className="rounded-xl shadow-md w-full h-64 object-cover" />
        <img src="https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Tech Classroom" className="rounded-xl shadow-md w-full h-64 object-cover" />
      </div>
    </div>
  );
}
