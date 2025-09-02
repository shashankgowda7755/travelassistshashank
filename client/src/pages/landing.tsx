import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-mountain text-primary-foreground text-2xl"></i>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Miles Alone</h1>
          <p className="text-muted-foreground mb-6">
            Your complete travel companion for nomadic journeys
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <i className="fas fa-map-pin text-primary mr-3"></i>
              Plan your routes and track destinations
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <i className="fas fa-users text-primary mr-3"></i>
              Remember everyone you meet
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <i className="fas fa-book text-primary mr-3"></i>
              Journal your adventures
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <i className="fas fa-chart-pie text-primary mr-3"></i>
              Track expenses and budget
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full"
            data-testid="button-login"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
