import './style.css';

const task_obj = function(title, due_date, project, desc, checked){
    return {title, due_date, project, desc, checked};
};

const displayController = function(){
    function createTask(task){
        const task_box = document.createElement("div");
        task_box.classList.add("task-box");

        const check_box = document.createElement("div");
        check_box.classList.add("check-box");
        const check = document.createElement("div");
        check.classList.add("check");
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
        due_date.textContent = task.due_date;
        const task_project = document.createElement("h6");
        task_project.classList.add("task-project");
        task_project.textContent = task.project;

        task_info.append(due_date);
        task_info.append(task_project);
        if (task.checked === 1){
            check.classList.add("checked");
            task_title.classList.add("done");
        }

        task_click_region.appendChild(task_info);
        task_box.appendChild(task_click_region);
        return task_box;
    }

    function updateTask(tasks){
        const task_flex_box = document.querySelector(".task-flex-box");
        for(const i of tasks){
            task_flex_box.appendChild(createTask(i));
        }
    }

    function init(){
        const content = document.querySelector("#content");

        const header = document.createElement("div");
        header.classList.add("header");
        const page_title = document.createElement("h1");
        page_title.classList.add("title");
        page_title.textContent = "myTodo";
        
        header.appendChild(page_title);
        content.appendChild(header);

        const grid_box = document.createElement("div");
        grid_box.classList.add("grid-box");

        content.appendChild(grid_box);

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

        //Default task
        const default1 = task_obj("Work", "10AM 11 Jun 2021", "#Project 1","None",0);
        const default2 = task_obj("Work1", "10AM 11 Jun 2021", "#Project 1","None",1);
        const default3 = task_obj("Work2", "10AM 11 Jun 2021", "#Project 1","None",1);
        let default_task = [default1, default2, default3] ;
        updateTask(default_task);
    }

    init();
    //return some function that might be needed for external use
}();

