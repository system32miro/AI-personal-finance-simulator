import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Shield,
  Smartphone,
  LineChart,
  Clock,
  CheckCircle2,
  Star,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.2
    }
  }
};

const features = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Segurança Garantida",
    description: "Dados encriptados e protegidos com os mais altos padrões de segurança."
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Acesso Mobile",
    description: "Gerencie suas finanças em qualquer lugar, a qualquer momento."
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    title: "Análises Detalhadas",
    description: "Gráficos e relatórios personalizados para melhor compreensão."
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Tempo Real",
    description: "Atualizações instantâneas de todas as suas transações."
  }
];

const howItWorks = [
  {
    step: 1,
    title: "Registe-se Gratuitamente",
    description: "Crie sua conta em menos de 2 minutos"
  },
  {
    step: 2,
    title: "Adicione Transações",
    description: "Registe suas receitas e despesas facilmente"
  },
  {
    step: 3,
    title: "Receba Insights",
    description: "Obtenha análises inteligentes sobre seus gastos"
  },
  {
    step: 4,
    title: "Alcance Objetivos",
    description: "Acompanhe e realize suas metas financeiras"
  }
];

const testimonials = [
  {
    name: "Maria Silva",
    role: "Profissional Liberal",
    content: "Finalmente consigo controlar minhas finanças de forma inteligente!",
    rating: 5
  },
  {
    name: "João Santos",
    role: "Empresário",
    content: "As análises da IA me ajudaram a economizar 30% em 3 meses.",
    rating: 5
  },
  {
    name: "Ana Costa",
    role: "Estudante",
    content: "Interface intuitiva e insights muito úteis para iniciantes.",
    rating: 4
  }
];

export default function Index() {
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20"
      >
        <div className="max-w-5xl w-full space-y-12 text-center">
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
              animate={{
                backgroundPosition: ["0%", "100%"],
                opacity: [0, 1],
                y: [20, 0]
              }}
              transition={{ duration: 1 }}
            >
              Finanças Pessoais Inteligentes
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Gerencie suas finanças com inteligência artificial, visualize insights e tome melhores decisões financeiras.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8"
            variants={containerVariants}
          >
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="transform-gpu"
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/20">
                <CardHeader>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 text-primary mb-2"
                  >
                    <DollarSign className="w-full h-full" />
                  </motion.div>
                  <CardTitle>Controle Financeiro</CardTitle>
                  <CardDescription>
                    Registre e monitore todas suas transações em um só lugar
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="transform-gpu"
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/20">
                <CardHeader>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 text-primary mb-2"
                  >
                    <TrendingUp className="w-full h-full" />
                  </motion.div>
                  <CardTitle>Análises Inteligentes</CardTitle>
                  <CardDescription>
                    Receba insights personalizados sobre seus gastos
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="transform-gpu"
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/20">
                <CardHeader>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 text-primary mb-2"
                  >
                    <PiggyBank className="w-full h-full" />
                  </motion.div>
                  <CardTitle>Metas Financeiras</CardTitle>
                  <CardDescription>
                    Defina e acompanhe suas metas de economia
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex gap-4 justify-center"
          >
            <Button
              size="lg"
              variant="outline"
              className="relative overflow-hidden"
              onClick={() => navigate("/auth?mode=login")}
            >
              <motion.span
                className="relative z-10 flex items-center"
                animate={{ x: isHovering ? 5 : 0 }}
              >
                Entrar
                <motion.div
                  animate={{ x: isHovering ? 5 : 0 }}
                  className="ml-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.span>
            </Button>

            <Button
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary text-white"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => navigate("/auth")}
            >
              <motion.span
                className="relative z-10 flex items-center"
                animate={{ x: isHovering ? 5 : 0 }}
              >
                Começar Agora
                <motion.div
                  animate={{ x: isHovering ? 5 : 0 }}
                  className="ml-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recursos Poderosos</h2>
            <p className="text-muted-foreground">Tudo que você precisa para uma gestão financeira eficiente</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground">Comece a controlar suas finanças em 4 passos simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                {index < howItWorks.length - 1 && (
                  <ChevronRight className="w-6 h-6 text-primary hidden lg:block absolute top-1/2 right-0 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O Que Dizem Nossos Utilizadores</h2>
            <p className="text-muted-foreground">Histórias reais de pessoas que transformaram suas finanças</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardContent className="pt-0">
                    <p className="text-sm italic mb-4">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-muted-foreground">Encontre respostas para as dúvidas mais comuns</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <CardTitle className="text-lg">É mesmo gratuito?</CardTitle>
                    <CardDescription>
                      Sim! A versão básica é totalmente gratuita. Oferecemos recursos premium para necessidades mais avançadas.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <CardTitle className="text-lg">Meus dados estão seguros?</CardTitle>
                    <CardDescription>
                      Absolutamente! Utilizamos encriptação de ponta a ponta e seguimos os mais rigorosos padrões de segurança.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Comece a Transformar Suas Finanças Hoje</h2>
          <p className="mb-8 text-primary-foreground/80">
            Junte-se a milhares de pessoas que já estão a melhorar sua vida financeira
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="group"
            onClick={() => navigate("/auth")}
          >
            Criar Conta Gratuita
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-6 border-t">
        <div className="max-w-5xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 Finanças Pessoais Inteligentes</p>
        </div>
      </footer>
    </AnimatePresence>
  );
}
