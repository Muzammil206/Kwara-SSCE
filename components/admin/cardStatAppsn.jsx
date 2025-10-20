import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"



export default function  CardStatAppsn({ filteredPayments = [] }) {

    const [stat, setStat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalApplications, setTotalApplications] = useState(0);
    const [totalpillarNo, setTotalpillarNo] = useState(0);

         useEffect(() => { 
        const fetchStats = async () => {
          try {
            setLoading(true);
            const response = await fetch('/api/paymentstatAppsn');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStat(data);
            console.log("Fetched stats:", stat);
        
            setTotalRevenue(data.total_mds_fees);
            setTotalApplications(data.total_applications);
            setTotalpillarNo(data.total_pillar_no);
          } catch (err) {
            setError(err.message);
            console.error("Error fetching stats:", err);
          } finally {
            setLoading(false);
          }
        }
        fetchStats();
      }, []);


    return ( 
        <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{filteredPayments.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {totalApplications}
                       {" "} applications completed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {filteredPayments.filter(
                          (payment) =>
                            payment.payment_status === "pending" || payment.payment_status === "verification-pending",
                        ).length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ₦{Number(totalRevenue || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">From mds fees</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Apssn FEE</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ₦{Number( (totalpillarNo * 4100)  || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Total Apssn Fee</p>
                    </CardContent>
                  </Card>
                </div>
        
               
                </>
    )
}