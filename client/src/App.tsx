import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { HomePage } from "@/pages/home";
import { OptimizationPage } from "@/pages/optimization"; // Added import


function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/optimization" component={OptimizationPage} /> {/* Added optimization route */}
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}