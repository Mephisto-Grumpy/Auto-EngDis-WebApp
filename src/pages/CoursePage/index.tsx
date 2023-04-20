import { useEffect, useContext, useState } from "react";

// Mantine UI - Components
import { Alert, Progress } from "@mantine/core";

// Materials UI - Icons
import { CheckCircle, Lock } from "@mui/icons-material";

// Axios
import axios from "axios";

// React Router
import { useParams } from "react-router-dom";

// Context
import { StudentContextType } from "../../@types/student";
import { StudentContext } from "../../contexts/studentContext";

// Components
import { MyLoader } from "../../components/MyLoader";
import { Constants } from "../../constants/constants";

// Payload
import { testPayload } from "./testPayload";

export const CoursePage: React.FC = () => {
  const { nodeId, parentNodeId } = useParams();
  const { studentData } = useContext(StudentContext) as StudentContextType;
  const [courseData, setCourseData] = useState<any[any]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function getCourseTree() {
    console.log(studentData);
    axios({
      method: "post",
      url: `${Constants.BASE_API_ENDPOINT}/api/CourseTree/getCourseTree`,
      data: {
        token: studentData!.token,
        nodeId: nodeId,
        parentNodeId: parentNodeId,
      },
    })
      .then((response) => {
        setCourseData(response.data[0]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }

  const handleAutoEngDis = async (data: any[any]) => {
    const tasks: any[any] = [];

    data.Children.map((dataChildren: any[any]) => {
      if (dataChildren.Name == "Explore" || dataChildren.Name == "Practice") {
        dataChildren.Children.map((subChildren: any[any]) => {
          tasks.push([data.ParentNodeId, subChildren.NodeId]);
        });
      }
    });

    console.log(tasks);

    const requests = [];

    for (let x in tasks) {
      requests.push(
        axios.post(`${Constants.BASE_API_ENDPOINT}/api/Progress/SetProgressPerTask`, {
          token: studentData!.token,
          CourseId: tasks[x][0] - 1,
          ItemId: tasks[x][1],
        })
      );
    }

    requests.push(
      axios.post(`${Constants.BASE_API_ENDPOINT}/api/UserTestV1/SaveUserTest`, {
        token: studentData!.token,
        payload: testPayload[1][2].payload,
        parentNodeId: 523592767,
        nodeId: 36140,
      })
    );

    axios
      .all(requests)
      .then(async () => await getCourseTree())
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    document.title = "Course | Auto English Discoveries Learning - (KMITL)";
    getCourseTree();
  }, []);

  if (isLoading) {
    return <MyLoader />;
  }

  return (
    <div className="p-4 mb-8">
      <div>
        <p className="text-center font-bold text-lg">
          Unit {courseData.Sequence}: {courseData.Name}
        </p>

        <div>
          {courseData.IsLocked ? (
            <div className="flex items-center justify-center mt-1">
              <Lock fontSize="small" style={{ color: "ef4444" }} />
              <p className="text-sm text-green-500 font-bold ml-1">
                บทเรียนถูกล็อก / หมดช่วงเวลาที่เปิดให้ทำแล้ว
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center mt-1">
              <CheckCircle fontSize="small" style={{ color: "22c555" }} />
              <p className="text-sm text-green-500 font-bold ml-1">
                บทเรียนนี้ยังเปิดให้ทำได้ตามปกติ
              </p>
            </div>
          )}
        </div>

        <div className="p-4 shadow border rounded-md mt-4">
          <p className="text-sm font-bold">Overall Unit Progress</p>
          <div className="flex items-center justify-between mt-1">
            <Progress
              className="w-10/12"
              color="orange"
              radius="md"
              animate
              value={courseData.Progress * 100}
            />
            <p className="font-bold text-sm">{Math.floor(courseData.Progress * 100)} %</p>
          </div>
          <p className="font-bold text-sm mt-1">
            คะแนนเฉลี่ยรวมของบทเรียนนี้ (Grade): {courseData.Grade + " %" || "-"}
          </p>
        </div>
      </div>

      <div>
        <div className="mt-4 p-1">
          <p className="text-base font-bold">Lessons - บทเรียนย่อยภายในบทนี้</p>
          <p className="text-sm text-slate-600 mt-1">
            บทเรียนย่อยภายในบทนี้ และความคืบหน้าของเแต่ละบทเรียน สามารถกดที่บทเรียนนั้นๆ
            เพื่อดูรายละเอียดเพิ่มเติม
          </p>
        </div>

        <div className="mt-4">
          <Alert title="วิธีการใช้บริการ Auto EngDis" color="orange" radius="md">
            <li>กดเลือกที่บทเรียนที่ต้องการ</li>
            <li>กดยืนยันเพื่อดำเนินการใช้บริการ Auto EngDis</li>

            <p className="mt-1 underline font-bold">
              (ปัจจุบัน Auto EngDis ยังไม่รองรับการใช้งานกับการทดแบบทดสอบท้ายบทเรียน)
            </p>
          </Alert>
        </div>

        <div className="mt-6">
          {courseData.Children.map((data: any, index: any) => (
            <div
              key={index}
              onClick={async () => {
                if (confirm("ยืนยันการใช้ Auto EngDis กับบทเรียนนี้ ?")) {
                  setIsLoading(true);
                  await handleAutoEngDis(data);
                }
              }}
            >
              <div className="p-3 shadow border rounded-lg mt-4">
                <div className="flex gap-1 items-center">
                  {data.IsLocked && !data.IsDone ? (
                    <Lock fontSize="small" style={{ color: "ef4444" }} />
                  ) : (
                    <></>
                  )}

                  {data.IsDone ? (
                    <CheckCircle fontSize="small" style={{ color: "22c555" }} />
                  ) : (
                    <></>
                  )}
                  <p className="text-sm font-bold">
                    Lesson {data.Sequence}: {data.Name}
                  </p>
                </div>

                {/* <div className="p-1 text-xs font-bold">
                  {data.Children.map((lesson: any, index: any) => (
                    <li className="text-xs font-medium">Lesson: {lesson.Name}</li>
                  ))}
                  <li className="">บทเรียนยังเปิดให้ทำได้ตามปกติ (ยังไม่ล็อก)</li>
                  
                </div> */}

                {data.IsLocked && !data.IsDone ? (
                  <p className="font-bold text-red-500 text-xs mt-1">
                    {" "}
                    บทเรียนถูกล็อก / หมดช่วงเวลาที่เปิดให้ทำแล้ว
                  </p>
                ) : (
                  <></>
                )}

                {data.IsDone ? (
                  <p className="font-bold text-green-500 text-xs mt-1">
                    {" "}
                    บทเรียนนี้ทำแบบฝึกหัด และแบบทดสอบท้ายบทครบแล้ว
                  </p>
                ) : (
                  <></>
                )}

                <div className="flex items-center justify-between mt-1">
                  <Progress
                    className="w-10/12"
                    color="orange"
                    radius="md"
                    animate
                    value={data.Progress * 100}
                  />
                  <p className="font-bold text-sm">{Math.floor(data.Progress * 100)} %</p>
                </div>

                {/* <p className="text-sm mt-1">
                  เกรดรวมทั้งหมดของบทเรียนนี้ (Grade):{" "}
                  <span>
                    {defaultCourseProgress.CourseProgressTree.Children[index].Grade || "-"}
                  </span>
                </p> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
