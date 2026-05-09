"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqs = {
  General: [
    {
      question: "How is Nookmarks different from other bookmark managers?",
      answer:
        'Unlike traditional managers that just save links, Nookmarks focuses on "Visual Snapshots" (saving images) and "Deep Focus Projects"—isolated workspaces that keep different parts of your digital life completely separate.',
    },
    {
      question: "Is there a browser extension?",
      answer:
        "Currently, Nookmarks is a powerful web application. A dedicated browser extension for even faster saving is a highly requested feature on our roadmap!",
    },
    {
      question: "Can I use Nookmarks on my mobile device?",
      answer:
        "Yes, Nookmarks is built with a responsive design (using TanStack Start and Tailwind CSS), ensuring a premium experience on desktops, tablets, and smartphones alike.",
    },
  ],
  Features: [
    {
      question: 'How does "AI Smart Tagging" work?',
      answer:
        "When you save a link, our AI analyzes the content and automatically suggests relevant tags, saving you the manual work of categorizing every item.",
    },
    {
      question: 'What are "Deep Focus Projects"?',
      answer:
        "Projects are isolated environments within Nookmarks. Bookmarks and snapshots in one project won't clutter another, making it perfect for separating work, hobbies, and personal research.",
    },
    {
      question: "Can I save images directly as bookmarks?",
      answer:
        'Absolutely. Our "Visual Snapshots" feature allows you to upload and categorize images as standalone entries, which is great for mood boards and research references.',
    },
  ],
  Pricing: [
    {
      question: "Is Nookmarks really free?",
      answer:
        "Yes! Core organizational features are free forever. We believe everyone should have access to tools for curating their digital knowledge.",
    },
    {
      question: "What are the limitations of the free version?",
      answer:
        "The free version has basic limits on image uploads and AI usage to keep our servers running. However, you can bypass most of these by providing your own API key.",
    },
    {
      question: 'What does "Bring Your Own Key" (BYOK) mean?',
      answer:
        "It means you can use your own OpenAI or Anthropic API keys within Nookmarks. This gives you full control over your costs and data, and allows you to use AI features without platform-imposed limits.",
    },
  ],
  "Privacy & Support": [
    {
      question: "Is my data private and secure?",
      answer:
        "Yes. By using your own API keys for AI and focusing on a lean architecture, we prioritize your data privacy. We don't sell your browsing habits or link data.",
    },
    {
      question: "How can I support Nookmarks?",
      answer:
        "As a free project, we rely on the community. You can support us via donations to help cover server costs and fuel continuous development.",
    },
  ],
};

type Category = keyof typeof faqs;
const categories = Object.keys(faqs) as Category[];

export function Faq() {
  const [activeCategory, setActiveCategory] = useState<Category>("General");

  const handleCategoryChange = (category: Category) => {
    if (activeCategory === category) return;
    setActiveCategory(category);
  };

  return (
    <section id="faq" className="relative w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg, 
            oklch(from var(--primary) l c h / 0.1) 0px, 
            oklch(from var(--primary) l c h / 0.1) 1px, 
            transparent 0px, 
            transparent 50%
          )`,
          backgroundSize: "20px 20px",
          maskImage: "linear-gradient(to top right, black, transparent 50%)",
          WebkitMaskImage:
            "linear-gradient(to top right, black, transparent 50%)",
        }}
      />
      <div className="mx-auto relative z-10 w-full max-w-5xl py-24 px-4 xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
          {/* Left Column */}
          <div className="md:col-span-5 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Know More
              </h2>
              <p className="text-lg text-muted-foreground max-w-[280px]">
                Everything you need to know about features, pricing, and
                troubleshooting.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                    activeCategory === category
                      ? "bg-primary text-background border-primary shadow-md"
                      : "bg-background text-foreground border-border hover:border-primary/30 hover:bg-muted",
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-7 flex flex-col">
            <div className="flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="flex flex-col"
                >
                  <Accordion className="w-full">
                    {faqs[activeCategory].map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={index.toString()}
                        className="border-border/60"
                      >
                        <AccordionTrigger className="text-base sm:text-lg font-medium hover:no-underline py-6">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed pr-8">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
