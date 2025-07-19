import EnrolledCourse from "./_components/EnrolledCourse"
import MyCourses from "./_components/MyCourses"
import WelcomeHeader from "./_components/WelcomeHeader"

function page() {
  return (
    <div>
      <WelcomeHeader/>
      <EnrolledCourse/>
      <MyCourses/>
    </div>
  )
}

export default page
