import { Clock, Mail, MapPin, Phone } from "lucide-react";
import React from "react";

const data = [
  {
    title: "Visit Us",
    subtitle: "123 Street, New York, USA",
    icon: MapPin,
  },
  {
    title: "Call Us",
    subtitle: "+1 234 567 890",
    icon: Phone,
  },
  {
    title: "Working Hours",
    subtitle: "8am - 5pm",
    icon: Clock,
  },
  {
    title: "Email Us",
    subtitle: "email@gmail.com",
    icon: Mail,
  },
];

const FooterTop = () => {
  return (
    <div className="text-xs grid grid-cols-2 items-center justify-between lg:grid-cols-4 gap-3 border-b max-w-full mt-8 mb-2">
      {data.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-4 group p-4 hover:bg-gray-50 transition-colors"
          >
            
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-gray-500 transition-colors group-hover:text-primary" />
            </div>
           
            <div>
              <h3 className="font-semibold text-gray-500 transition-colors group-hover:text-primary">
                {item.title}
              </h3>
             <div className="max-w-full w-full flex overflow-hidden">
             <p className="text-xs text-gray-600 break-all">{item.subtitle}</p>
             </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FooterTop;
