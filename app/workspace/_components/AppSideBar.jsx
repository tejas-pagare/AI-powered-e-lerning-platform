'use client'
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Book,
  Compass,
  LayoutDashboardIcon,
  PencilRulerIcon,
  UserCircle2Icon,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NewCourse from "./NewCourseForm";

const SidebarOptions = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/workspace",
  },
  {
    title: "My Learning",
    icon: Book,
    path: "/workspace/my-course",
  },
  {
    title: "Explore Courses",
    icon: Compass,
    path: "/workspace/explore",
  },
  {
    title: "AI Tools",
    icon: PencilRulerIcon,
    path: "/workspace/ai-tools",
  },
  {
    title: "Billing",
    icon: WalletCards,
    path: "/workspace/billing",
  },
  {
    title: "Profile",
    icon: UserCircle2Icon,
    path: "/workspace/profile",
  },
];

export function AppSidebar() {
  const Path = usePathname();
  
  return (
    <Sidebar>
      <SidebarHeader asChild>
        <Image
          src={"/logo.svg"}
          alt="EasyTax"
          className="p-2"
          width={120}
          height={100}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <NewCourse >
            <Button className={'text-sm w-full'}>Create new Course</Button>
          </NewCourse>
          
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {
                SidebarOptions.map((item,value)=>(
                  <SidebarMenuItem asChild key={item.title}>
                    <SidebarMenuButton className={`p-2 text-[16px]   ${Path.includes(item.path)?"text-primary font-semibold bg-blue-50":""}`}>
                      <Link className="flex items-center justify-center gap-4" href={item.path}>
                      <item.icon size={"16"} fontWeight={600}/>
                      <span >{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
