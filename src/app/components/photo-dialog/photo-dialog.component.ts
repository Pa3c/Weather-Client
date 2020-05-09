import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


interface DialogData {
  photo: any;
  title: string;
  description: string;
  fileName :string;
}

@Component({
  selector: 'app-photo-dialog',
  templateUrl: './photo-dialog.component.html',
  styleUrls: ['./photo-dialog.component.css']
})
export class PhotoDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PhotoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }
  onFileInput(files :FileList){
    this.data.fileName = files.item(0).name;

      const reader = new FileReader();
      reader.readAsDataURL(files.item(0));
      reader.onload = () => this.data.photo = reader.result;
  }

}
