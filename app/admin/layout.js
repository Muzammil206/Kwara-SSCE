


export const metadata = {
  title: "APPSN Admin platform ",
  description: "APPSN Admin platform ",
  manifest: '/manifest.json',
  icons: {
    icon: "/appsn.ico",
    pyramid: "/pyramid.png",
  },
};


export default function Layout({ children }) {
  

  return (
    
      <div>
        {children}
      </div>
    
  )
}

