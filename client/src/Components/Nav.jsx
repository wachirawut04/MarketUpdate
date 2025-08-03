import { Link } from "react-scroll";
import { CiBank } from "react-icons/ci";
import Button from "./Button";

const Nav = () => {

  const content = <>

    <div className="lg:hiden block absolute top-16 w-full left-0 right-0 bg-slate-900 transition">
          <ul className="text-center text-xl p-20">
            <Link spy={true} smooth={true}  to="Market">
              <li className="my-4 py-4 border-b border-slate-800 hoever:bgslate-800 hoever:rounded">Market</li> 
            </Link>
            <Link spy={true} smooth={true} to="Graph">
              <li className="my-4 py-4 border-b border-slate-800 hoever:bgslate-800 hoever:rounded">Graph</li> 
            </Link>
            <Link spy={true} smooth={true} to="Download">
              <li className="my-4 py-4 border-b border-slate-800 hoever:bgslate-800 hoever:rounded">Download</li> 
            </Link>
          </ul>
    </div>  
  </>

  return (
    <nav className="w-full bg-[#323643] fixed top-0 left-0 z-40">
  <div className="max-w-screen-xl mx-auto flex justify-between items-center text-[#93DEFF] py-4">
    <div className="flex items-center">
      <span className="text-4xl font-semibold px-5">
        <CiBank />
      </span>
    </div>
    <div className="hidden md:flex items-center justify-end gap-10 text-[14px] px-5 font-normal">
  <li className="list-none ">
    <Link to="Market" smooth={true} duration={500}>
      Market
    </Link>
  </li>
  <li className="list-none">
    <Link to="Graph" smooth={true} duration={500}>
      Graph
    </Link>
  </li>
  <li className="list-none">
    <Link to="Download" smooth={true} duration={500}>
      Download
    </Link>
  </li>
  <li className="list-none ml-30">
    <Button>Sign In</Button>
  </li>
</div>

  </div>
</nav>
  );
};

export default Nav;
