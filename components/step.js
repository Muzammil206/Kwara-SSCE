"use client"
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import Step5 from "./step5";
import Step6 from "./step6";
import { motion } from "framer-motion"
import FormHeader from "./formheader";
import { Button } from "./ui/button";




const MultiStepForm = () => {


    const steps = ["Upload CSV", "Calculate Area",  "Pillar Details", "Fee Details","Client Info", "Review"]
    const [userid, setUserid] = useState("");
    const [step, setStep] = useState(1);
    const [csvFile, setCsvFile] = useState(null);
    const {error, setError} = useState(null);
    const [area, setArea] = useState(null);
    const router = useRouter();
    const [isloading, setIsLoading] = useState(false)
    const [location, setLocation] = useState(null)
    const [lga, setLga] = useState(null)
    const [status, setStatus] = useState('pending')
    const [schedule, setSchedule] = useState(null)
    const [geojson, setgeojson] = useState(null)
    const [user, setUser] = useState(null)
    const [statu, setStatu] = useState(null)
    const [mdsFee, setMdsFee] = useState(0)
    
    const { register, handleSubmit, watch, setValue } = useForm({
      defaultValues: {
        csvFile: null,
        calculatedArea: "",
        pillarType: "",
        pillarNo: "",   
        pillarAmount: "",
        paymentAmount: "",
        clientName: "",
        clientAddress: "",
        planNumber: "",
        landUse: "",
        schedule: "",
        geojson: null,

      },

    });

    const handleFileUpload = (file) => {
        console.log("File uploaded:", file.name)
        setCsvFile(file)
     }

     const onCalculatedArea = (area) => {
        console.log("Area calculated:", area)
        setArea(area)
     }


     const onGeojson = (data) => {
      
      setgeojson(data)
      console.log("Geojson:", geojson)
    
   }

     const onLoction = (location) => {   
         
        setLocation(location.address)   
        console.log("Location:", location)
        setLga(location.local_government )
                                 
    }


   
    const onSchedule = (schedule) => {
        setSchedule(schedule)
        console.log("Schedule:", schedule)
    }

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);
    
    


    useEffect(() => {
        
        const fetchUser = async () => { 
           
            const {
              data: { session },
              error: sessionError,
            } = await supabase.auth.getSession()
      
            if (sessionError || !session) {
              router.push("/newlogin")
              return
            }
      
            setUser(session.user)
            console.log("User:", session.user)
            
            // Get user data from users table
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq(' auth_user_id', session.user.id)
              .single()
      
            if (userError) {
              console.error("User error:", userError)
              toast.error("Failed to load user information")
              return
            }
            setUserid(userData.user_id)
            setStatu(userData.status)
            setUser(userData)
            console.log("User data.....:", userData)
      
            }

      fetchUser();
    }, []); 
      
const progress = ((step - 1) / (steps.length - 1)) * 100

  const onCancle = () => {
    router.push('/dashboard');
    }
    

  const onSubmit =  (data) => {
    
    console.log("Form data:", data.paymentAmount * 0.7
    );
    setIsLoading(true)
      const fetchPillar = async () => {     
        
        const { data: pillar_applications, error } = await supabase
        .from('pillar_applications')
        .insert([
          { user_id: userid,  area: area, pillar_type: data.pillarType,  paid_amount: data.paymentAmount, mds_fee: (data.paymentAmount * 0.7) , pillar_no: data.pillarNo,  location: location, lga: lga,  land_use: data.landUse,
          client_address: data.clientAddress, client_name: data.clientName, plan_number: data.planNumber, status: 'pending',  geom: geojson, schedule: schedule.schedule, application_type: 'regular', surveyor_name: user.name}  
        ])
        .single();
        
        
        
        if (error) {
            setError(error.message);
            console.error('Error inserting pillar application:', error.message);
            return;
        }
        await supabase.from("temp_geojson").delete().eq("user_id", userid);
        
        setIsLoading(false) 
        
      }
    
     fetchPillar();

  };


  if(statu == "inactive")
  {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Account Inactive</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Your account is currently inactive. Please contact support for assistance.</p>
          <Button onClick={() => router.push("/dashboard/support")} className="bg-red-600 text-white hover:bg-red-700">
            Contact Support
          </Button>
        </div>
      </div>
    )
  }

  if(statu == "Suspended")
  {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Account Suspended</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Your account has been suspended. Please contact support for more information.</p>
          <Button onClick={() => router.push("/dashboard/support")} className="bg-red-600 text-white hover:bg-red-700">
            Contact Support
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className=" abosulute w-screen -mt-8 top-3 left-0 z-50 ">
      
     </div>
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
    
     <FormHeader userid={userid}/>

    {/* Progress Bar */}
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((stepName, index) => (
          <span key={stepName} className={`text-sm font-medium ${index < step ? "text-blue-600" : "text-gray-400"}`}>
            {stepName}
          </span>
        ))}
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>

    <motion.div
      key={step}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {step === 1 && <Step1 watch={watch} register={register} nextStep={nextStep} onFileUpload={handleFileUpload} />}
      {step === 2 && <Step2 watch={watch} onSchedule={onSchedule} register={register} onGeojson={onGeojson} onLocation={onLoction} onCalculatedArea={onCalculatedArea} setValue={setValue} csvFile={csvFile} prevStep={prevStep}  nextStep={nextStep}/>}
      {step === 3 && <Step3 watch={watch} userId={userid} register={register} nextStep={nextStep} prevStep={prevStep} setValue={setValue}  />}
      {step === 4 && <Step4  watch={watch} setValue={setValue} register={register} nextStep={nextStep} prevStep={prevStep} onSubmit={handleSubmit(onSubmit)} area={area} schedule={schedule} />}
      {step === 5 && <Step5  watch={watch} prevStep={prevStep}  nextStep={nextStep}   register={register} />}
      {step === 6 && <Step6  watch={watch} prevStep={prevStep} onSubmit={handleSubmit(onSubmit)}  register={register}  onCalculatedArea={onCalculatedArea} csvFile={csvFile} area={area}  location={location} schedule={schedule} onCancel={onCancle} />}
       { error && <div className="text-red-500">{error}</div>}
    </motion.div>

    
  </div>
  </div>
  );
};

export default MultiStepForm;
