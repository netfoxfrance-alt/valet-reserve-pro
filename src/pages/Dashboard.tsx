import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AppointmentCard } from '@/components/dashboard/AppointmentCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { Appointment } from '@/types/booking';
import { packs } from '@/lib/packs';

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Marie Dubois',
    clientPhone: '06 12 34 56 78',
    clientEmail: 'marie@exemple.fr',
    pack: packs[1],
    date: new Date(),
    time: '10:00',
    vehicleType: 'berline',
    status: 'confirmed',
  },
  {
    id: '2',
    clientName: 'Pierre Martin',
    clientPhone: '06 98 76 54 32',
    clientEmail: 'pierre@exemple.fr',
    pack: packs[2],
    date: new Date(),
    time: '14:00',
    vehicleType: 'suv',
    status: 'confirmed',
  },
  {
    id: '3',
    clientName: 'Sophie Bernard',
    clientPhone: '06 11 22 33 44',
    clientEmail: 'sophie@exemple.fr',
    pack: packs[0],
    date: new Date(Date.now() + 86400000),
    time: '09:00',
    vehicleType: 'citadine',
    status: 'pending',
  },
];

const stats = [
  { name: "Aujourd'hui", value: '3', icon: Calendar, color: 'bg-primary/10 text-primary' },
  { name: 'Cette semaine', value: '12', icon: TrendingUp, color: 'bg-accent/10 text-accent' },
  { name: 'Clients total', value: '156', icon: Users, color: 'bg-secondary text-secondary-foreground' },
  { name: 'Durée moyenne', value: '2h15', icon: Clock, color: 'bg-muted text-muted-foreground' },
];

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="lg:pl-64">
        <DashboardHeader 
          title="Rendez-vous" 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="p-4 lg:p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.name} variant="elevated" className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Appointments section */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Prochains rendez-vous</h2>
              <p className="text-sm text-muted-foreground">Gérez vos réservations à venir</p>
            </div>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
