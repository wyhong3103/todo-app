import './style.css';
import {
    format, 
    parse,
    compareAsc
} from 'date-fns';
import Save_svg from './save.svg';
import Del_svg from './del.svg';
import Cancel_svg from './cancel.svg';

let current_tasks = [];
//0 = today, 1 = upcoming, others = project #
let cur_tab = 0;

const task_obj = function(title, due_date, project, desc, checked){
    return {
        title,
        due_date,
        project, 
        desc, 
        checked
    };
};


const toDoList = function(){
    //save to local storage
    function saveTask(index){
        let title = document.querySelector("#task-title-input").value;
        let due_date = document.querySelector("#task-due-date-input").value;
        let desc = document.querySelector("#task-desc-input").value;

        current_tasks[index].title = title;
        let new_due_date = [];
        for(let i = 0; i < due_date.length; i++){
            if (due_date[i] === 'T'){
                new_due_date.push(" ");
            }else{
                new_due_date.push(due_date[i]);
            }
        }
        due_date = new_due_date.join("");
        current_tasks[index].due_date = parse(due_date, 'yyyy-MM-dd HH:mm', new Date());
        current_tasks[index].desc = desc;
    }

    //delete from local storage
    function deleteTask(index){
        current_tasks.splice(index, 1);
    }

    function toggleTask(index){
        current_tasks[index].checked = !current_tasks[index].checked;
    }

    return {saveTask, deleteTask, toggleTask};
}();

const displayController = function(){
    const _content = document.querySelector("#content");

    function createTask(index){
        const task = current_tasks[index];
        const task_box = document.createElement("div");
        task_box.classList.add("task-box");

        const check_box = document.createElement("div");
        check_box.classList.add("check-box");
        const check = document.createElement("div");
        check.classList.add("check");
        check.addEventListener("click",function(){
            toDoList.toggleTask(index);
            updateTask();
        });
        check_box.appendChild(check);
        task_box.appendChild(check_box);

        const task_click_region = document.createElement("div");
        task_click_region.classList.add("task-click");
        
        const task_title = document.createElement('h4');
        task_title.classList.add("task-title");
        task_title.textContent = task.title;

        task_click_region.appendChild(task_title);
        
        const task_info = document.createElement("div");
        task_info.classList.add("task-info");
        const due_date = document.createElement("h6");
        due_date.classList.add("due-date");
        due_date.textContent = format(task.due_date, "h:mm a MM/dd/yyyy");
        const task_project = document.createElement("h6");
        task_project.classList.add("task-project");
        task_project.textContent = task.project;

        task_info.append(due_date);
        task_info.append(task_project);
        if (task.checked === true){
            check.classList.add("checked");
            task_title.classList.add("done");
        }

        task_click_region.appendChild(task_info);
        
        //Add Event Listener
        task_click_region.addEventListener("click", function(){
            taskPopUp(index);
            //update information
        });

        task_box.appendChild(task_click_region);
        return task_box;
    }

    function taskClear(){
        const task_flex_box = document.querySelector(".task-flex-box");
        task_flex_box.innerHTML = "";
    }

    function updateTask(){
        const task_flex_box = document.querySelector(".task-flex-box");
        taskClear();
        for(let i = 0; i < current_tasks.length; i++){
            task_flex_box.appendChild(createTask(i));
        }
    }

    function initBasicUI(){
        const main_content = document.createElement("div");
        main_content.classList.add("main-content");
        _content.appendChild(main_content);

        const header = document.createElement("div");
        header.classList.add("header");
        const page_title = document.createElement("h1");
        page_title.classList.add("title");
        page_title.textContent = "myTodo";
        
        header.appendChild(page_title);
        main_content.appendChild(header);

        const grid_box = document.createElement("div");
        grid_box.classList.add("grid-box");

        main_content.appendChild(grid_box);

        //Initialize tabs UI
        const tabs = document.createElement("div");
        tabs.classList.add("tabs");

        const today_tab = document.createElement("div");
        today_tab.classList.add("today");
        const upcoming_tab = document.createElement("div");
        upcoming_tab.classList.add("upcoming");
        today_tab.classList.add("tab");
        upcoming_tab.classList.add("tab");

        const today_text = document.createElement("h3");
        today_text.textContent = "Today";
        const upcoming_text = document.createElement("h3");
        upcoming_text.textContent = "Upcoming";

        today_tab.appendChild(today_text);
        upcoming_tab.appendChild(upcoming_text);

        tabs.appendChild(today_tab);
        tabs.appendChild(upcoming_tab);

        const projects = document.createElement("div");
        projects.classList.add("projects");

        const project_title = document.createElement("div");
        project_title.classList.add("projects-title");
        project_title.classList.add("new-proj-btn");
        project_title.classList.add("tab");
        const project_title_text = document.createElement("h3");
        project_title_text.textContent = "Projects";
        const project_title_plus = document.createElement("h3");
        project_title_plus.classList.add("plus");
        project_title_plus.textContent = "+";
        project_title.appendChild(project_title_text);
        project_title.appendChild(project_title_plus);
        
        const ul = document.createElement("ul");
        
        projects.appendChild(project_title);
        projects.appendChild(ul);

        tabs.appendChild(projects);

        grid_box.appendChild(tabs);

        //Initialize tasks UI
        const tasks = document.createElement("div");
        tasks.classList.add("tasks");
        const tab_title = document.createElement("h2");
        tab_title.classList.add("tab-title");
        tab_title.textContent = "Today";

        tasks.appendChild(tab_title);

        const task_flex_box = document.createElement("div");
        task_flex_box.classList.add("task-flex-box");
        
        tasks.appendChild(task_flex_box);
        grid_box.appendChild(tasks);
    }

    function defaultTask(){
        //Default task
        const default1 = task_obj("Work", new Date(2022, 7, 15, 20,10) , "#Project 1","Keep working!",0);
        const default2 = task_obj("Swim",new Date(2022, 9, 15, 10,15) , "#Project 2","Learn to swim!",0);
        const default3 = task_obj("Code",new Date(2022, 8, 15, 10,20) , "#Personal","Finish the unfinished task.",0);
        current_tasks = [default1, default2, default3];
        updateTask();
    }

    function closePopUp(){
        const pop_up = document.querySelector(".task-view-box");
        _content.removeChild(pop_up);
    }

    function taskPopUp(index){
        const task_view_box = document.createElement("div");
        task_view_box.classList.add("task-view-box");

        const task_view = document.createElement("div");
        task_view.classList.add("task-view");

        let input_divs = [];
        for(let i = 0; i < 4; i++){
            const input_div = document.createElement("div");
            input_div.classList.add("input");
            input_divs.push(input_div);
        }

        input_divs[0].classList.add("input-title");
        const label_title = document.createElement("label");
        label_title.for = "task-title-input";
        label_title.textContent = "Title*";
        const input_title = document.createElement("input");
        input_title.type = "text";
        input_title.id = "task-title-input"
        input_title.value = (index < current_tasks.length ? current_tasks[index].title : "");
        input_divs[0].appendChild(label_title);
        input_divs[0].appendChild(input_title);
        

        input_divs[1].classList.add("input-due-date");
        const label_due_date = document.createElement("label");
        label_due_date.for = "task-due-date-input";
        label_due_date.textContent = "Due Date*";
        const input_due_date = document.createElement("input");
        input_due_date.type = "datetime-local";
        input_due_date.id = "task-due-date-input"
        input_due_date.value = (index < current_tasks.length ? format(current_tasks[index].due_date, "yyyy-MM-dd HH:mm") : "");
        input_divs[1].appendChild(label_due_date);
        input_divs[1].appendChild(input_due_date);

        input_divs[2].classList.add("input-project");
        const label_project = document.createElement("label");
        label_project.textContent = "Project";
        const span_project = document.createElement("span");
        span_project.textContent = (index < current_tasks.length ? current_tasks[index].project : "");
        span_project.classList.add("task-project-input");
        input_divs[2].appendChild(label_project);
        input_divs[2].appendChild(span_project);

        input_divs[3].classList.add("input-desc");
        const label_desc = document.createElement("label");
        label_desc.for = "task-desc-input";
        label_desc.textContent = "Description";
        const textarea = document.createElement("textarea");
        textarea.id = "task-desc-input";
        textarea.cols = "30";
        textarea.rows = "10";
        textarea.textContent = (index < current_tasks.length ? current_tasks[index].desc : "");
        input_divs[3].appendChild(label_desc);
        input_divs[3].appendChild(textarea);

        for (const i of input_divs){
            task_view.appendChild(i);
        }

        const task_view_btns = document.createElement("div");
        task_view_btns.classList.add("task-view-btns");

        let btn_divs = [];
        for(let i = 0; i < 3; i++){
            const btn_div = document.createElement("div");
            btn_div.classList.add("task-btn");
            btn_divs.push(btn_div);
        }
        btn_divs[0].classList.add("task-del");
        const img_del = new Image();
        img_del.src = Del_svg;
        img_del.alt = "del-svg";
        btn_divs[0].appendChild(img_del);
        btn_divs[0].addEventListener("click",function(){
            toDoList.deleteTask(index);
            updateTask();
        });

        btn_divs[1].classList.add("task-cancel");
        const img_cancel = new Image();
        img_cancel.src = Cancel_svg;
        img_cancel.alt = "cancel-svg";
        btn_divs[1].appendChild(img_cancel);

        btn_divs[2].classList.add("task-save");
        const img_save = new Image();
        img_save.src = Save_svg;
        img_save.alt = "save-svg";
        btn_divs[2].appendChild(img_save);
        btn_divs[2].addEventListener("click",function(){
            toDoList.saveTask(index);
            updateTask();
        });

        for(const i of btn_divs){
            i.addEventListener("click", closePopUp);
            task_view_btns.appendChild(i);
        }
        task_view.appendChild(task_view_btns);

        task_view_box.appendChild(task_view);
        _content.appendChild(task_view_box);
    }


    function init(){
        initBasicUI();
        //no tasks found in storage
        if (true){
            defaultTask();
        }
            //set Today
    }

    //return some function that might be needed for external use
    init();
}();

