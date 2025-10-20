
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { set } from "date-fns";
import { useState, useEffect } from "react"



 export default function CardStatSurcon({ filteredApplications = [] }) {


    const [stat, setStat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalApplications, setTotalApplications] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
   

      useEffect(() => { 
        const fetchStats = async () => {
          try {
            setLoading(true);
            const response = await fetch('/api/paymentstatSurcon');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStat(data);
            console.log("Fetched stats:", stat);
            console.log(data)
            console.log(data.total_applications, 'applications omoooo')
            setError(null);
            setTotalApplications(data.total_applications);
            setTotalRevenue(data.total_pillar_payment_fees);
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
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                { filteredApplications.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalApplications} approved
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredApplications.filter((app) => app.status === "Pending" || app.status === "pending").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
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
              <p className="text-xs text-muted-foreground mt-1">From Total Pillar Payment Fees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredApplications.length
                  ? Math.round(
                      (filteredApplications.filter((app) => app.status === "Approved").length /
                        filteredApplications.length) *
                        100,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">For filtered period</p>
            </CardContent>
          </Card>
        </div>
        </>
    )
}