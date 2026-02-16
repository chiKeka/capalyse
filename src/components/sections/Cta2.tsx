import { containerVariants } from "@/lib/animations";
import Button, { ButtonVariant } from "../ui/Button";
import { motion } from "framer-motion";

type Props = {
  data: string[];
  imageSrc: string;
  headerTag: string;
  reverse?: boolean;
  componentBg?: string;
  cardBg?: string;
  headerTextColor?: string;
  contentTextColor?: string;
  buttonVariant?: ButtonVariant;
};

function Cta2({
  data,
  imageSrc,
  cardBg,
  headerTag,
  reverse,
  componentBg,
  headerTextColor,
  contentTextColor,
  buttonVariant,
}: Props) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      className={`${componentBg ? componentBg : "bg-green"}  w-full p-2 lg:p-0 h-auto`}
    >
      <div
        className={`max-w-7xl  ${
          cardBg ? cardBg : "transparent"
        } items-center gap-16 rounded-[24px] justify-center mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${
          reverse ? "lg:flex-row-reverse" : "lg:flex-row"
        } py-[64px]`}
      >
        <img
          src={imageSrc}
          alt="SME benefit"
          className="rounded-2xl shadow-2xl w-auto lg:h-[35rem] "
        />
        <div className="flex flex-col gap-10">
          <p
            className={`text-4xl  ${
              headerTextColor ? headerTextColor : "text-[#F4F6F8]"
            }  font-bold text-start`}
          >
            {headerTag}
          </p>
          <div className="flex flex-col items-start gap-6">
            {data.map((list, i) => {
              return (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  key={i}
                  className="flex gap-3 items-center"
                >
                  <img src={"/icons/verifyCheck.svg"} className=" w-8 h-8" />
                  <p
                    className={`text-base font-normal ${
                      contentTextColor ? contentTextColor : "text-[#F4F6F8]"
                    }  `}
                  >
                    {list}
                  </p>
                </motion.div>
              );
            })}
            <Button variant={buttonVariant ? buttonVariant : "secondary"}>Sign Up Now</Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Cta2;
